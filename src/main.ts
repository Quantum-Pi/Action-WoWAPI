import * as core from '@actions/core';
import WoWAPI from './api/wowapi';
import { Region, isRegion } from './api/wowtypes';

/**
 * The main function for the action.
 * @returns {Promise<void>} Resolves when the action is complete.
 */
export async function run(): Promise<void> {
	try {
		const client_id: string = core.getInput('client_id');
		const client_secret: string = core.getInput('client_secret');
		const temp = core.getInput('region');
		const region: Region = isRegion(temp) ? temp : 'us';
		const realm: string = core.getInput('realm');
		const name: string = core.getInput('name');

		const api = new WoWAPI(client_id, client_secret, region, realm, name);
		const mounts = await api.getMounts();
		const toys = await api.getToys();
		const pets = await api.getPets();
		const titles = await api.getTitles();
		const seasons = await api.getMythicSeasons();
		const character = await api.getCharacterMedia();

		const wowProfile = {
			titles,
			mounts,
			pets,
			toys,
			mythicPlus: seasons,
			character
		};

		const json = JSON.stringify(wowProfile)
			.replace(/\\/g, '')
			.replace(/('|\$|\(|\)|!)/g, '\\$1')
			// eslint-disable-next-line no-control-regex
			.replace(/[^\x00-\x7F]/g, '')
			.replace(/"https:\/\/render.worldofwarcraft.com\/us\/([^"]*)"/g, '`${A}$1`')
			.replace(/\$\{A\}npcs\/zoom\/creature-display-([^`]*)/g, '${B}$1')
			.replace(/\$\{A\}icons\/56\/([^`]*)/g, '${C}$1');

		const output = `
  const A = 'https://render.worldofwarcraft.com/us/'
  const B = \`\${A}npcs/zoom/creature-display-\`
  const C = \`\${A}icons/56/\`
  export interface Toy {
      name: string;
      source: string;
      id: number;
      icon: string;
      rarity: number | null;
  }
  export interface Titles {
      active: {
          name: string;
          display_string: string;
      };
      titles: {
          id: number;
          name: string;
          rarity: number | null;
      }[];
  }
  export interface Pet {
    name: string;
    description: string;
    id: number;
    source?: string;
    icon: string;
    type: string;
    rarity: number | null;
  }
  export interface Mount {
    rarity: number | null;
    icon: string;
    name: string;
    description: string;
    id: number;
    source?: string;
  }
  export interface Character {
    avatar: string;
    inset: string;
    main: string;
    name: string;
    realm: string;
  }
  export interface MythicSeason {
    id: number;
    io: {
      color: {
        r: number;
        g: number;
        b: number;
        a: number;
      };
      rating: number;
    };
    best_runs: {
      completed_timestamp: number;
      dungeon_name: string;
      duration: number;
      is_completed_within_time: boolean;
      affixes: string[];
      level: number;
      rating: {
        color: {
          r: number;
          g: number;
          b: number;
          a: number;
        };
        rating: number;
      };
    }[];
  }
  
  export interface WoWProfile {
      titles: Titles,
      mounts: Mount[],
      pets: Pet[],
      toys: Toy[],
    character: Character,
      mythicPlus: MythicSeason[]
  } 
  
  export const wowProfile: WoWProfile = ${json}`;
		core.setOutput('json', output);
	} catch (error) {
		// Fail the workflow run if an error occurs
		if (error instanceof Error) core.setFailed(error.message);
	}
}

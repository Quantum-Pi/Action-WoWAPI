import { getItemRarity, getMountRarity, getPetRarity, getTitleRarity } from './wowheadapi';
import {
	Character,
	GetCharacterMedia,
	GetCharacterMythicSeason,
	GetCharacterTitles,
	GetCollectionMounts,
	GetCollectionPets,
	GetCollectionToys,
	GetMount,
	GetPet,
	GetToy,
	Mount,
	MythicSeason,
	Pet,
	Region,
	Titles,
	Token,
	Toy
} from './wowtypes';
import { wait } from '../wait';

type Params = { [key: string]: string | number };

export default class WoWAPI {
	private token: string | null = null;

	constructor(
		private clientId: string,
		private clientSecret: string,
		private region: Region,
		private realm: string,
		private character: string
	) {}

	private async init(): Promise<void> {
		const formData = new FormData();
		formData.append('grant_type', 'client_credentials');
		const res = await fetch('https://oauth.battle.net/token', {
			method: 'POST',
			headers: {
				Authorization: `Basic ${btoa(`${this.clientId}:${this.clientSecret}`)}`
			},
			body: formData
		});
		const json: Token = await res.json();
		this.token = json.access_token;
	}

	private getRoute(route: string, params: Params): string {
		return `https://${this.region}.api.blizzard.com/${route}?${Object.entries(params)
			.map(([key, value]) => `${key}=${value}`)
			.join('&')}`;
	}

	private async apiFetch(endpoint: string, params: Params, headers: Params): Promise<any> {
		if (!this.token) await this.init();
		const res = await fetch(this.getRoute(endpoint, params), {
			headers: {
				Authorization: `Bearer ${this.token}`,
				...headers
			}
		});
		if (!res.ok) {
			return new Error(`${res.status}: ${res.statusText}`, { cause: await res.text() });
		}
		return await res.json();
	}

	private async fetchUrl<T>(url: string): Promise<T> {
		return (await (
			await fetch(`${url}&locale=en_US`, {
				headers: {
					Authorization: `Bearer ${this.token}`
				}
			})
		).json()) as Promise<T>;
	}

	async getMounts(): Promise<Mount[]> {
		const mounts = (await this.apiFetch(
			`profile/wow/character/${this.realm}/${this.character}/collections/mounts`,
			{
				locale: 'en-US'
			},
			{
				'Battlenet-Namespace': 'profile-us'
			}
		)) as GetCollectionMounts;
		return await Promise.all(
			mounts.mounts.map(async (mount, i) => {
				await wait(250 * i);
				const mountInfo = await this.fetchUrl<GetMount>(`${mount.mount.key.href}&locale=en_US`);
				const mountIcon = (await this.fetchUrl<any>(`${mountInfo.creature_displays[0].key.href}&locale=en_US`)).assets[0].value as string;

				const obj: Mount = {
					name: mountInfo.name.replace(/"/g, "'"),
					description: mountInfo.description.replace(/"/g, "'"),
					id: mountInfo.id,
					icon: mountIcon,
					rarity: await getMountRarity(mount.mount.id)
				};
				if (mountInfo.source) obj['source'] = mountInfo.source.name;
				return obj;
			})
		);
	}

	async getPets(): Promise<Pet[]> {
		const pets = (await this.apiFetch(
			`profile/wow/character/${this.realm}/${this.character}/collections/pets`,
			{
				locale: 'en-US'
			},
			{
				'Battlenet-Namespace': 'profile-us'
			}
		)) as GetCollectionPets;

		const petMap: { [key: string]: Pet } = {};
		for (const pet of pets.pets) {
			await wait(250);
			const petInfo = await this.fetchUrl<GetPet>(`${pet.species.key.href}&locale=en_US`);
			if (!petMap[petInfo.id]) {
				const obj: Pet = {
					name: petInfo.name.replace(/"/g, "'"),
					description: petInfo.description.replace(/"/g, "'"),
					id: petInfo.id,
					icon: petInfo.icon,
					type: petInfo.battle_pet_type.name,
					rarity: await getPetRarity(petInfo.id)
				};
				if (petInfo.source) obj['source'] = petInfo.source.name;
				petMap[petInfo.id] = obj;
			}
		}
		return Object.values(petMap);
	}

	async getToys(): Promise<Toy[]> {
		const toys = (await this.apiFetch(
			`profile/wow/character/${this.realm}/${this.character}/collections/toys`,
			{
				locale: 'en-US'
			},
			{
				'Battlenet-Namespace': 'profile-us'
			}
		)) as GetCollectionToys;

		return await Promise.all(
			toys.toys.map(async (toy, i) => {
				await wait(250 * i);
				const toyInfo = await this.fetchUrl<GetToy>(`${toy.toy.key.href}&locale=en_US`);
				const toyIcon = (await this.fetchUrl<any>(`${toyInfo.media.key.href}&locale=en_US`)).assets[0].value as string;

				return {
					name: toyInfo.item.name.replace(/"/g, "'"),
					source: toyInfo.source.name,
					id: toyInfo.id,
					icon: toyIcon,
					rarity: await getItemRarity(toyInfo.item.id)
				};
			})
		);
	}

	async getTitles(): Promise<Titles> {
		const titles = (await this.apiFetch(
			`profile/wow/character/${this.realm}/${this.character}/titles`,
			{
				locale: 'en_US'
			},
			{
				'Battlenet-Namespace': 'profile-us'
			}
		)) as GetCharacterTitles;

		const mappedTitles = await Promise.all(
			titles.titles.map(async (title, i) => {
				await wait(250 * i);
				return {
					id: title.id,
					// @ts-expect-error inconsistent locale
					name: (typeof title.name === 'string' ? title.name : title.name.en_US).replace(/"/g, "'"),
					rarity: await getTitleRarity(title.id)
				};
			})
		);

		return {
			active: {
				name: titles.active_title.name,
				display_string: titles.active_title.display_string
			},
			titles: mappedTitles
		};
	}

	async getMythicSeasons(): Promise<MythicSeason[]> {
		// @ts-expect-error August 30, 2016: Legion release date - M+ S1
		const diff = new Date(Date.now() - new Date('August 30, 2016'));
		const monthsSinceS1 = (diff.getFullYear() - 1970) * 12 + diff.getMonth() + 1;
		const approxSeasons = Math.round(monthsSinceS1 / 6);

		const seasons: MythicSeason[] = [];
		for (let i = 0; i < approxSeasons; i++) {
			await wait(250);
			const season = (await this.apiFetch(
				`profile/wow/character/${this.realm}/${this.character}/mythic-keystone-profile/season/${i}`,
				{
					locale: 'en_US'
				},
				{
					'Battlenet-Namespace': 'profile-us'
				}
			)) as GetCharacterMythicSeason;
			if (!(season instanceof Error)) {
				seasons.push({
					id: season.season.id,
					io: season.mythic_rating,
					best_runs: season.best_runs.map(run => ({
						completed_timestamp: run.completed_timestamp,
						dungeon_name: run.dungeon.name,
						duration: run.duration,
						is_completed_within_time: run.is_completed_within_time,
						affixes: run.keystone_affixes.map(affix => affix.name),
						level: run.keystone_level,
						rating: run.mythic_rating
					}))
				});
			}
		}

		return seasons;
	}

	async getCharacterMedia(): Promise<Character> {
		const media = (await this.apiFetch(
			`profile/wow/character/${this.realm}/${this.character}/character-media`,
			{
				locale: 'en_US'
			},
			{
				'Battlenet-Namespace': 'profile-us'
			}
		)) as GetCharacterMedia;

		return {
			name: media.character.name,
			realm: media.character.realm.name,
			main: media.assets.find(asset => asset.key === 'main-raw')?.value ?? '',
			avatar: media.assets.find(asset => asset.key === 'avatar')?.value ?? '',
			inset: media.assets.find(asset => asset.key === 'inset')?.value ?? ''
		};
	}
}

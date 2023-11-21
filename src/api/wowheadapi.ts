import { wait } from '../wait';

const local_fetch = async (url: string): Promise<number | null> => {
	const html = await (await fetch(url)).text();
	const rarity = /Attained by ([0-9]*)% of profiles/g.exec(html);
	if (rarity) {
		return parseInt(rarity[1]);
	}
	return null;
};

export const getMountRarity = async (mountId: number): Promise<number | null> => {
	let i = 0;
	while (i < 5) {
		try {
			const res = await local_fetch(`https://www.wowhead.com/mount/${mountId}`);
			return res;
		} catch (e) {
			i++;
			await wait(100);
		}
	}
	return null;
};

export const getPetRarity = async (mountId: number): Promise<number | null> => {
	let i = 0;
	while (i < 5) {
		try {
			const res = await local_fetch(`https://www.wowhead.com/battle-pet/${mountId}`);
			return res;
		} catch (e) {
			i++;
			await wait(100);
		}
	}
	return null;
};

export const getItemRarity = async (itemId: number): Promise<number | null> => {
	let i = 0;
	while (i < 5) {
		try {
			const res = await local_fetch(`https://www.wowhead.com/item=${itemId}`);
			return res;
		} catch (e) {
			i++;
			await wait(100);
		}
	}
	return null;
};

export const getTitleRarity = async (titleId: number): Promise<number | null> => {
	let i = 0;
	while (i < 5) {
		try {
			const res = await local_fetch(`https://www.wowhead.com/title-mask/${titleId}`);
			return res;
		} catch (e) {
			i++;
			await wait(100);
		}
	}
	return null;
};

export type Region = 'us' | 'eu' | 'kr' | 'tw';
export const isRegion = (value: string): value is Region => {
	const temp = value as Region;
	if (temp === 'eu' || temp === 'kr' || temp === 'tw' || temp === 'us') return true;
	return false;
};

export interface Token {
	access_token: string;
	token_type: string;
	expires_in: number;
	sub: string;
}

export interface GetCollectionMounts {
	mounts: {
		mount: {
			key: {
				href: string;
			};
			name: string;
			id: number;
		};
		is_favorite: boolean;
		is_useable: boolean;
	}[];
}

export interface GetMount {
	id: number;
	name: string;
	creature_displays: {
		key: {
			href: string;
		};
		id: number;
	}[];
	description: string;
	source: { type: string; name: string };
	faction: { type: string; name: string };
	requirements: any;
}

export interface Mount {
	rarity: number | null;
	icon: string;
	name: string;
	description: string;
	id: number;
	source?: string;
}

export interface GetCollectionPets {
	pets: {
		species: {
			key: {
				href: string;
			};
			name: string;
			id: number;
		};
		level: number;
		quality: {
			type: string;
			name: string;
		};
		stats: {
			breed_id: number;
			health: number;
			power: number;
			speed: number;
		};
		is_favorite: boolean;
		creature_display: {
			key: {
				href: string;
			};
			id: number;
		};
		id: number;
	}[];
}

export interface GetPet {
	id: number;
	name: string;
	battle_pet_type: {
		id: number;
		type: string;
		name: string;
	};
	description: string;
	is_capturable: boolean;
	is_tradable: boolean;
	is_battlepet: boolean;
	is_alliance_only: boolean;
	is_horde_only: boolean;
	abilities: {
		ability: {
			key: {
				href: string;
			};
			name: string;
			id: number;
		};
		slot: number;
		required_level: number;
	}[];
	source: {
		type: string;
		name: string;
	};
	icon: string;
	creature: {
		key: {
			href: string;
		};
		name: string;
		id: number;
	};
	is_random_creature_display: boolean;
	media: {
		key: {
			href: string;
		};
		id: number;
	};
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

export interface GetCollectionToys {
	toys: {
		toy: {
			key: {
				href: string;
			};
			name: string;
			id: number;
		};
		is_favorite: boolean;
	}[];
}

export interface GetToy {
	id: number;
	item: {
		key: {
			href: string;
		};
		name: string;
		id: number;
	};
	source: {
		type: string;
		name: string;
	};
	should_exclude_if_uncollected: boolean;
	media: {
		key: {
			href: string;
		};
		id: number;
	};
}

export interface Toy {
	name: string;
	source?: string;
	id: number;
	icon: string;
	rarity: number | null;
}

export interface GetCharacterTitles {
	character: {
		key: {
			href: string;
		};
		name: string;
		id: number;
		realm: {
			key: {
				href: string;
			};
			name: string;
			id: number;
			slug: string;
		};
	};
	active_title: {
		key: {
			href: string;
		};
		name: string;
		id: number;
		/** {name} encoded */
		display_string: string;
	};
	titles: {
		key: {
			href: string;
		};
		name: string;
		id: number;
	}[];
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

export interface GetCharacterMythicSeason {
	season: {
		key: {
			href: string;
		};
		id: number;
	};
	best_runs: {
		completed_timestamp: number;
		duration: number;
		keystone_level: number;
		keystone_affixes: {
			key: {
				href: string;
			};
			name: string;
			id: number;
		}[];
		members: {
			character: {
				name: string;
				id: number;
				realm: {
					key: {
						href: string;
					};
					id: number;
					slug: string;
				};
			};
			specialization: {
				key: {
					href: string;
				};
				name: string;
				id: number;
			};
			race: {
				key: {
					href: string;
				};
				name: string;
				id: number;
			};
			equipped_item_level: number;
		}[];
		dungeon: {
			key: {
				href: string;
			};
			name: string;
			id: number;
		};
		is_completed_within_time: false;
		mythic_rating: {
			color: {
				r: number;
				g: number;
				b: number;
				a: number;
			};
			rating: number;
		};
	}[];
	character: {
		key: {
			href: string;
		};
		name: string;
		id: number;
		realm: {
			key: {
				href: string;
			};
			name: string;
			id: number;
			slug: string;
		};
	};
	mythic_rating: {
		color: {
			r: number;
			g: number;
			b: number;
			a: number;
		};
		rating: number;
	};
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

export interface GetCharacterMedia {
	character: {
		name: string;
		id: number;
		realm: {
			name: string;
			id: number;
		};
	};
	assets: {
		key: 'avatar' | 'inset' | 'main-raw';
		value: string;
	}[];
}

export interface Character {
	avatar: string;
	inset: string;
	main: string;
	name: string;
	realm: string;
}

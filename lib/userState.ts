import { create } from 'zustand';

export interface Challenge {
  id: string;
  title: string;
  description: string;
  targetKm: number;
  pointsReward: number;
  completed: boolean;
}

export interface Award {
  id: string;
  title: string;
  description: string;
  costPoints: number;
  unlocked: boolean;
  redeemed: boolean;
  image: string;
}

interface UserState {
  totalKm: number;
  points: number;
  challenges: Challenge[];
  awards: Award[];
  addKm: (km: number) => void;
  redeemAward: (awardId: string) => void;
}

const mockChallenges: Challenge[] = [
  { id: 'c1', title: 'The Start', description: 'Run the first 10 KM', targetKm: 10, pointsReward: 100, completed: false },
  { id: 'c2', title: 'Halfway There', description: 'Reach 250 KM', targetKm: 250, pointsReward: 500, completed: false },
  { id: 'c3', title: 'Death Valley', description: 'Cross Death Valley at 300 KM', targetKm: 300, pointsReward: 1000, completed: false },
  { id: 'c4', title: 'The Speed Project', description: 'Finish 500 KM', targetKm: 500, pointsReward: 5000, completed: false },
];

const mockAwards: Award[] = [
  { id: 'a1', title: 'Sticker Pack', description: 'Exclusive 500 KM stickers', costPoints: 200, unlocked: false, redeemed: false, image: '/awards/sticker.png' },
  { id: 'a2', title: 'T-Shirt', description: 'Official event t-shirt', costPoints: 1000, unlocked: false, redeemed: false, image: '/awards/tshirt.png' },
  { id: 'a3', title: 'VIP Meet', description: 'Meet Manu post-race', costPoints: 5000, unlocked: false, redeemed: false, image: '/awards/vip.png' },
];

export const useUserStore = create<UserState>((set) => ({
  totalKm: 0,
  points: 0,
  challenges: mockChallenges,
  awards: mockAwards,

  addKm: (km: number) => set((state) => {
    const newTotalKm = state.totalKm + km;
    
    // Check for newly completed challenges
    let pointsGained = 0;
    const newChallenges = state.challenges.map(c => {
      if (!c.completed && newTotalKm >= c.targetKm) {
        pointsGained += c.pointsReward;
        return { ...c, completed: true };
      }
      return c;
    });

    const newPoints = state.points + pointsGained;

    // Unlock awards if enough points
    const newAwards = state.awards.map(a => {
      if (!a.unlocked && newPoints >= a.costPoints) {
        return { ...a, unlocked: true };
      }
      return a;
    });

    return {
      totalKm: newTotalKm,
      points: newPoints,
      challenges: newChallenges,
      awards: newAwards
    };
  }),

  redeemAward: (awardId: string) => set((state) => {
    const award = state.awards.find(a => a.id === awardId);
    if (award && award.unlocked && !award.redeemed && state.points >= award.costPoints) {
      return {
        points: state.points - award.costPoints,
        awards: state.awards.map(a => a.id === awardId ? { ...a, redeemed: true } : a)
      };
    }
    return state;
  })
}));

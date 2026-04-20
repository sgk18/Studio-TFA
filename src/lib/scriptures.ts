export type Scripture = {
  verse: string;
  reference: string;
  theme: string;
};

export const DAILY_SCRIPTURES: Scripture[] = [
  {
    verse: "The Lord bless you and keep you; the Lord make his face shine on you and be gracious to you.",
    reference: "Numbers 6:24-25",
    theme: "Blessing"
  },
  {
    verse: "Commit your way to the Lord; trust in him and he will do this: He will make your righteous reward shine like the dawn.",
    reference: "Psalm 37:5-6",
    theme: "Trust"
  },
  {
    verse: "Every good and perfect gift is from above, coming down from the Father of the heavenly lights.",
    reference: "James 1:17",
    theme: "Gratitude"
  },
  {
    verse: "The steadfast love of the Lord never ceases; his mercies never come to an end; they are new every morning.",
    reference: "Lamentations 3:22-23",
    theme: "Faithfulness"
  },
  {
    verse: "Whatever you do, work at it with all your heart, as working for the Lord, not for human masters.",
    reference: "Colossians 3:23",
    theme: "Dedication"
  }
];

export function getRandomScripture(): Scripture {
  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
  return DAILY_SCRIPTURES[dayOfYear % DAILY_SCRIPTURES.length]!;
}

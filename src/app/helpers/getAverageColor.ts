import { FastAverageColor } from "fast-average-color";

export const getAverageColor = (src: string) => {
  const color = new FastAverageColor();
  const image = document.createElement("img");
  image.src = src;
  return color.getColor(image).hex;
};

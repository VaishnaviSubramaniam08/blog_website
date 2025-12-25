export const CATEGORIES = [
  { name: "Technology", color: "#4a6cff" },
  { name: "Lifestyle", color: "#ff6b9d" },
  { name: "Travel", color: "#26de81" },
  { name: "Food", color: "#feca57" },
  { name: "Photography", color: "#ff7979" },
  { name: "Business", color: "#54a0ff" },
  { name: "Health", color: "#48dbfb" },
  { name: "Fashion", color: "#ff6348" },
  { name: "Sports", color: "#1dd1a1" },
  { name: "Education", color: "#00d2d3" },
  { name: "Entertainment", color: "#a29bfe" },
  { name: "Science", color: "#fd79a8" },
];

export const getCategoryColor = (categoryName) => {
  const category = CATEGORIES.find(
    (cat) => cat.name.toLowerCase() === categoryName.toLowerCase()
  );
  return category ? category.color : "#95a5a6";
};

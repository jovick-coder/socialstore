/**
 * Product Categories Configuration
 * Defines available categories and their dynamic attributes
 */

export interface AttributeOption {
  label: string;
  value: string;
  color?: string; // for color attributes
}

export interface Attribute {
  key: string;
  label: string;
  type: "text" | "select" | "multiselect" | "color" | "toggle";
  options?: AttributeOption[];
  required?: boolean;
  placeholder?: string;
}

export interface CategoryConfig {
  label: string;
  icon?: string;
  description?: string;
  attributes: Attribute[];
}

export const categories: Record<string, CategoryConfig> = {
  clothing: {
    label: "Clothing",
    icon: "👕",
    description: "Apparel and fashion items",
    attributes: [
      {
        key: "sizes",
        label: "Available Sizes",
        type: "multiselect",
        options: [
          { label: "Extra Small", value: "XS" },
          { label: "Small", value: "S" },
          { label: "Medium", value: "M" },
          { label: "Large", value: "L" },
          { label: "Extra Large", value: "XL" },
          { label: "2XL", value: "2XL" },
          { label: "3XL", value: "3XL" },
        ],
      },
      {
        key: "colors",
        label: "Available Colors",
        type: "multiselect",
        options: [
          { label: "Black", value: "black", color: "#000000" },
          { label: "White", value: "white", color: "#FFFFFF" },
          { label: "Red", value: "red", color: "#EF4444" },
          { label: "Blue", value: "blue", color: "#3B82F6" },
          { label: "Green", value: "green", color: "#10B981" },
          { label: "Yellow", value: "yellow", color: "#FBBF24" },
          { label: "Purple", value: "purple", color: "#A855F7" },
          { label: "Pink", value: "pink", color: "#EC4899" },
          { label: "Gray", value: "gray", color: "#6B7280" },
          { label: "Brown", value: "brown", color: "#92400E" },
        ],
      },
      {
        key: "material",
        label: "Material",
        type: "select",
        options: [
          { label: "Cotton", value: "cotton" },
          { label: "Polyester", value: "polyester" },
          { label: "Wool", value: "wool" },
          { label: "Silk", value: "silk" },
          { label: "Linen", value: "linen" },
          { label: "Blend", value: "blend" },
        ],
      },
      {
        key: "gender",
        label: "Gender",
        type: "select",
        options: [
          { label: "Unisex", value: "unisex" },
          { label: "Mens", value: "mens" },
          { label: "Womens", value: "womens" },
          { label: "Kids", value: "kids" },
        ],
      },
    ],
  },
  electronics: {
    label: "Electronics",
    icon: "📱",
    description: "Electronic devices and gadgets",
    attributes: [
      {
        key: "brand",
        label: "Brand",
        type: "select",
        options: [
          { label: "Apple", value: "apple" },
          { label: "Samsung", value: "samsung" },
          { label: "Sony", value: "sony" },
          { label: "LG", value: "lg" },
          { label: "Dell", value: "dell" },
          { label: "HP", value: "hp" },
          { label: "Other", value: "other" },
        ],
      },
      {
        key: "warranty",
        label: "Warranty (months)",
        type: "select",
        options: [
          { label: "No Warranty", value: "0" },
          { label: "6 Months", value: "6" },
          { label: "1 Year", value: "12" },
          { label: "2 Years", value: "24" },
        ],
      },
    ],
  },
  beauty: {
    label: "Beauty & Personal Care",
    icon: "💄",
    description: "Cosmetics, skincare, and personal care products",
    attributes: [
      {
        key: "skinType",
        label: "Suitable For",
        type: "multiselect",
        options: [
          { label: "Dry Skin", value: "dry" },
          { label: "Oily Skin", value: "oily" },
          { label: "Combination", value: "combination" },
          { label: "Sensitive", value: "sensitive" },
          { label: "All Types", value: "all" },
        ],
      },
      {
        key: "vegan",
        label: "Vegan Friendly",
        type: "toggle",
      },
      {
        key: "crueltyFree",
        label: "Cruelty Free",
        type: "toggle",
      },
    ],
  },
  food: {
    label: "Food & Beverages",
    icon: "🍽️",
    description: "Food, drinks, and edibles",
    attributes: [
      {
        key: "dietary",
        label: "Dietary",
        type: "multiselect",
        options: [
          { label: "Vegetarian", value: "vegetarian" },
          { label: "Vegan", value: "vegan" },
          { label: "Gluten Free", value: "glutenFree" },
          { label: "Dairy Free", value: "dairyFree" },
          { label: "Halal", value: "halal" },
        ],
      },
      {
        key: "expiryDays",
        label: "Shelf Life (days)",
        type: "text",
        placeholder: "e.g., 30",
      },
    ],
  },
  home: {
    label: "Home & Living",
    icon: "🏠",
    description: "Furniture, decor, and home items",
    attributes: [
      {
        key: "material",
        label: "Material",
        type: "select",
        options: [
          { label: "Wood", value: "wood" },
          { label: "Metal", value: "metal" },
          { label: "Fabric", value: "fabric" },
          { label: "Glass", value: "glass" },
          { label: "Plastic", value: "plastic" },
        ],
      },
      {
        key: "colors",
        label: "Available Colors",
        type: "multiselect",
        options: [
          { label: "Black", value: "black", color: "#000000" },
          { label: "White", value: "white", color: "#FFFFFF" },
          { label: "Brown", value: "brown", color: "#92400E" },
          { label: "Gray", value: "gray", color: "#6B7280" },
          { label: "Beige", value: "beige", color: "#D2B48C" },
        ],
      },
    ],
  },
  other: {
    label: "Other",
    icon: "📦",
    description: "Other products",
    attributes: [],
  },
};

/**
 * Get category by key
 */
export function getCategory(key: string): CategoryConfig | null {
  return categories[key] || null;
}

/**
 * Get all category keys
 */
export function getCategoryKeys(): string[] {
  return Object.keys(categories);
}

/**
 * Get category label
 */
export function getCategoryLabel(key: string): string {
  return categories[key]?.label || key;
}

/**
 * Get attributes for a category
 */
export function getCategoryAttributes(key: string): Attribute[] {
  return categories[key]?.attributes || [];
}

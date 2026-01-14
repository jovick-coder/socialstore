/**
 * Utility functions for WhatsApp integration
 */

/**
 * Generate WhatsApp share URL for a single product
 */
export function generateWhatsAppProductLink(
  product: {
    name: string;
    price: number;
    description?: string | null;
  },
  catalogLink: string,
  whatsappNumber?: string
): string {
  const formattedPrice = new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
  }).format(product.price);

  const message = `🛍️ *${product.name}*\n💰 ${formattedPrice}\n\n${
    product.description ? product.description + "\n\n" : ""
  }View catalog: ${catalogLink}`;

  const encodedMessage = encodeURIComponent(message);

  // If whatsappNumber is provided, send to that number, otherwise just share
  if (whatsappNumber) {
    // Remove any non-digit characters from phone number
    const cleanNumber = whatsappNumber.replace(/\D/g, "");
    return `https://wa.me/${cleanNumber}?text=${encodedMessage}`;
  }

  return `https://wa.me/?text=${encodedMessage}`;
}

/**
 * Generate WhatsApp share URL for entire catalog
 */
export function generateWhatsAppCatalogLink(
  storeName: string,
  catalogLink: string,
  productCount: number,
  whatsappNumber?: string
): string {
  const message = `🏪 *${storeName}*\n\n✨ Browse ${productCount} amazing products!\n\n🔗 ${catalogLink}\n\n💬 Chat with me on WhatsApp to order!`;

  const encodedMessage = encodeURIComponent(message);

  if (whatsappNumber) {
    const cleanNumber = whatsappNumber.replace(/\D/g, "");
    return `https://wa.me/${cleanNumber}?text=${encodedMessage}`;
  }

  return `https://wa.me/?text=${encodedMessage}`;
}

/**
 * Format currency for display
 */
export function formatCurrency(
  amount: number,
  currency: string = "NGN"
): string {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: currency,
  }).format(amount);
}

/**
 * Generate public product URL
 */
export function generateProductUrl(
  slug: string,
  productId: string,
  baseUrl?: string
): string {
  const base =
    baseUrl || (typeof window !== "undefined" ? window.location.origin : "");
  return `${base}/${slug}/product/${productId}`;
}

/**
 * Generate catalog URL
 */
export function generateCatalogUrl(slug: string, baseUrl?: string): string {
  const base =
    baseUrl || (typeof window !== "undefined" ? window.location.origin : "");
  return `${base}/${slug}`;
}

/**
 * Generate WhatsApp order message (Customer → Vendor)
 * Used when customer submits a cart
 */
export function generateOrderWhatsAppMessage(
  storeName: string,
  items: Array<{ name: string; quantity: number; price: number }>,
  cartUrl: string
): string {
  const itemsList = items
    .map((item, index) => {
      const total = item.price * item.quantity;
      return `${index + 1}. ${item.name}\n   Qty: ${
        item.quantity
      } × ${formatCurrency(item.price)} = ${formatCurrency(total)}`;
    })
    .join("\n\n");

  const totalAmount = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const message = `Hi ${storeName} 👋

I'd like to order the following items:

${itemsList}

*Total: ${formatCurrency(totalAmount)}*

Please review my order here:
${cartUrl}

Thank you! 🛍️`;

  return message;
}

/**
 * Generate WhatsApp confirmation message (Vendor → Customer)
 * Used when vendor confirms an order
 */
export function generateConfirmationWhatsAppMessage(
  storeName: string,
  items: Array<{ name: string; quantity: number; price: number }>
): string {
  const itemsList = items
    .map((item, index) => {
      return `${index + 1}. ${item.name} (Qty: ${item.quantity})`;
    })
    .join("\n");

  const totalAmount = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const message = `✅ *Your order has been confirmed!*

Items:
${itemsList}

*Total: ${formatCurrency(totalAmount)}*

Delivery details will follow shortly.
Thank you for shopping with ${storeName} 🙏`;

  return message;
}

/**
 * Generate WhatsApp deep link with message
 */
export function generateWhatsAppLink(
  phoneNumber: string,
  message: string
): string {
  const cleanNumber = phoneNumber.replace(/\D/g, "");
  const encodedMessage = encodeURIComponent(message);
  return `https://wa.me/${cleanNumber}?text=${encodedMessage}`;
}

/**
 * Generate WhatsApp link for cart order submission
 */
export function generateCartWhatsAppLink(
  storeName: string,
  whatsappNumber: string,
  items: Array<{ name: string; quantity: number; price: number }>,
  cartUrl: string
): string {
  const message = generateOrderWhatsAppMessage(storeName, items, cartUrl);
  return generateWhatsAppLink(whatsappNumber, message);
}

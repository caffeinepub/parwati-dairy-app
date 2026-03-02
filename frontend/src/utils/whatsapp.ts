import { format } from 'date-fns';

interface OrderData {
  name: string;
  phone: string;
  address: string;
  product: string;
  quantity: string;
}

const WHATSAPP_NUMBER = '918553965714';

export function sendWhatsAppOrder(orderData: OrderData, deliveryDate?: Date): void {
  // Format the delivery date in a readable format
  const formattedDeliveryDate = deliveryDate 
    ? format(deliveryDate, 'EEEE, MMMM d, yyyy') 
    : 'Not specified';

  const message = `Hello Parwati Dairy,

I want to order:

Product: ${orderData.product}
Quantity: ${orderData.quantity}

Name: ${orderData.name}
Address: ${orderData.address}
Phone: ${orderData.phone}
Delivery Date: ${formattedDeliveryDate}

Delivery: Yes`;

  const encodedMessage = encodeURIComponent(message);
  const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodedMessage}`;

  window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
}

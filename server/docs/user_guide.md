# AgriLink Platform: User Guide & Knowledge Base

## 1. Platform Overview

**AgriLink** is a digital marketplace dedicated to bridging the gap between local farmers and consumers. Our platform eliminates intermediaries, empowering farmers to sell fresh produce at fair prices while providing households with direct access to high-quality, traceable food sources from their own community.

### 1.1 Core Mission

- **For Farmers:** To provide digital tools that simplify inventory management, expand market reach, and ensure fair compensation for their harvest.
- **For Customers:** To offer a transparent, convenient way to discover local food sources, ensuring freshness and supporting the local economy.

### 1.2 User Roles

The platform supports two distinct account types, each with a specialized dashboard:

1.  **Customers:** Individuals seeking to purchase fresh produce. Features include farm discovery maps, product browsing, shopping cart management, and order tracking.
2.  **Farmers:** Producers looking to sell their harvest. Features include a dedicated farm profile builder, inventory management system, AI-assisted content tools, and an order fulfillment dashboard.

---

## 2. Security & Privacy Standards

AgriLink prioritizes user safety and data privacy through industry-standard practices:

- **Data Encryption:** We utilize advanced encryption standards (bcrypt) for password storage. Passwords are never stored in plain text, ensuring that not even platform administrators can access them.
- **Session Security:** User sessions are protected using JSON Web Tokens (JWT). This ensures that your login state is secure and automatically times out to prevent unauthorized access from neglected devices.
- **Input Protection:** All data entered into the platform (forms, product names, bio descriptions) undergoes strict sanitization to prevent malicious code injection and cross-site scripting (XSS) attacks.
- **Location Privacy:**
  - _Farmers:_ Farm location data is public to allow customers to find you on the discovery map.
  - _Customers:_ Your location data is used strictly for the "Find Farms Near Me" feature and delivery distance calculation. It is not tracked or shared with third parties.

---

## 3. Customer User Guide

### 3.1 Account Setup

- **Registration:** To start shopping, create an account by selecting the "Customer" role. A valid email address and mobile phone number are required. Your phone number is essential for farmers to coordinate delivery or pickup.
- **Profile Management:** We recommend completing your profile with your First and Last Name. This helps farmers accurately identify you and your orders during delivery.
- **Password Recovery:** If you lose access to your account, use the "Forgot Password" feature to receive a secure, time-limited reset link via email.

### 3.2 Discovering Farms

- **Interactive Map:** The homepage features a dynamic map displaying registered farms in your region.
  - _Navigation:_ You can zoom, pan, and click on farm markers to view a summary of their offerings.
  - _Geolocation:_ Use the "Use My Location" button to automatically center the map on your area and filter farms by distance (e.g., within 10km, 25km).
- **Farm Stores:** Clicking on a farm takes you to their dedicated store page, where you can view their bio, specialties, and available products.

### 3.3 Shopping & Ordering

- **Product Catalog:** Browse products by category (Vegetables, Fruits, Dairy, etc.) or search for specific items using the search bar.
- **Smart Cart:** You can add items from multiple different farms to your cart.
  - _Note:_ Because AgriLink operates on a direct-to-consumer model, items are grouped by farm. Checking out will create **separate orders** for each farm to ensure direct logistics.
- **Checkout Process:**
  1.  Review your cart summary, which shows subtotals for each farm.
  2.  Confirm your contact details.
  3.  Place the order.
- **Payment Method:** The platform currently supports **Cash on Delivery (COD)**. You pay the farmer directly when you receive your goods, ensuring trust and satisfaction with the product quality.

### 3.4 Tracking Your Orders

Navigate to **Dashboard > My Orders** to track the status of your purchases:

1.  **Pending (Incoming):** Your order has been placed and is waiting for the farmer to review and accept it.
2.  **Pickup/Delivery:** The farmer has accepted the order. It is being harvested, packed, or is currently en route to you.
3.  **Completed:** You have received the items and paid the farmer.
4.  **Cancelled:** The order was cancelled. This typically happens if an item goes out of stock unexpectedly or if the farmer cannot fulfill the request.

---

## 4. Farmer User Guide

### 4.1 Farm Profile Setup

- **Digital Identity:** Upon registration, you set a unique "Farm Name" that becomes your brand on the platform.
- **Location Pinning:** You must set your farm's exact location on the map. This is the most critical step for visibility, as it allows local customers to discover you.
- **AI Bio Generator:** AgriLink integrates Generative AI tools. If you are unsure what to write for your bio, simply input your farm name and specialties, and the AI will generate a professional, engaging description for you.

### 4.2 Product Management

- **Listing Products:** Go to the "My Products" tab to add new items. You can set:
  - _Name & Description:_ Detailed information about the produce.
  - _Price & Unit:_ Set clear pricing (e.g., per kg, per piece, per bundle).
  - _Stock Level:_ Real-time inventory tracking.
- **AI Categorization:** When you upload a product image, our AI analyzes it to suggest the correct category (e.g., suggesting "Vegetables" for a picture of carrots), saving you time.
- **Inventory Control:**
  - _Active:_ Product is visible to customers.
  - _Inactive:_ Product is hidden from the store (useful for out-of-season items).
  - _Archived:_ Product is removed from lists but sales data is kept for reports.
  - _Automatic Stock Management:_ If a product's stock reaches 0, it is automatically marked as "Out of Stock" and cannot be ordered until replenished.

### 4.3 Order Fulfillment

- **Incoming Orders:** Check your dashboard daily for new orders. Review the items and the customer's contact information.
- **Processing:**
  1.  Verify you have the stock available.
  2.  Contact the customer via the provided phone number to confirm the delivery time and location.
  3.  Update the status to **"Ready for Delivery"** to notify the customer.
- **Completion:** Once you have delivered the goods and collected payment, mark the order as **"Completed"** to record the revenue in your sales report.

### 4.4 Analytics Dashboard

Farmers have access to powerful insights to help grow their business:

- **Total Revenue:** Track your earnings over time.
- **Best Sellers:** Identify which products are in highest demand.
- **Top Customers:** See who your most loyal customers are based on spending.
- **Reports:** Generate monthly or yearly performance reports to plan your next planting season.

---

## 5. Future Roadmap & Upcoming Features

The AgriLink team is continuously working to enhance the platform. The following features are currently in development:

1.  **Online Payments:** Integration of secure credit card and digital wallet gateways to offer cashless transaction options.
2.  **Delivery Network:** A new "Delivery Partner" role will be introduced to assist farmers who lack their own transportation logistics, connecting them with local drivers.
3.  **Community Supported Agriculture (CSA):** A subscription model allowing customers to subscribe to weekly "harvest boxes" from their favorite farms.
4.  **Mobile Application:** A dedicated mobile app for iOS and Android to provide push notifications and easier order management on the go.
5.  **In-App Chat:** A built-in messaging system to allow secure, direct communication between farmers and customers without exchanging personal phone numbers.

---

## 6. Troubleshooting & FAQ

**Q: I am a customer. Why can't I complete my order?**

- **A:** Please check that your profile contains your First and Last Name. Farmers require this for identification. Also, ensure that the items in your cart are still in stock; the system performs a final stock check at checkout to prevent over-selling.

**Q: How do I change my farm's location on the map?**

- **A:** Navigate to _My Profile > Edit Profile_. In the location section, you can click on the map to drag the marker to your new location. Remember to save your changes.

**Q: Can I cancel an order after placing it?**

- **A:** Orders cannot be cancelled by the customer once they are in the "Delivery" phase. If the order is still "Pending," please contact the farmer directly using the phone number provided in the order details or contact platform support.

**Q: What happens if a farmer cancels my order?**

- **A:** You will receive a notification (status update) in your dashboard. This usually occurs if the fresh produce passed quality checks but was insufficient in quantity. You will not be charged as payment is Cash on Delivery.

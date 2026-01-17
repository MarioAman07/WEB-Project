# Travel Planner

## Description
**Travel Planner** is an interactive web application designed to help users organize travel ideas and future trips.  
The app currently supports destination browsing with category filters, a favorites system using `localStorage`, dynamic routing placeholders for future features, and a contact form that saves user inquiries to a JSON file.

---

## Team Members & Contributions
- **Sabina**  
  - UI/UX styling, layout polishing, and content organization to keep the project clean and attractive.
  
- **Aiym**  
  - Frontend interactions and dynamic destination browsing interface (filters + grid).
  
- **Aman**  
  - Feature planning from a user perspective, testing flows, and ensuring the site is easy to use.
  
- **Alibek**  
  - Server-side logic (Express routing), contact form handling, saving data to JSON, and request validation.

---

## **Database Used**
- **SQLite**:  
  The project uses **SQLite** as the database for storing and managing data such as travel destinations.

---

## **Table Structure**
### **items** Table:
- **id** (INTEGER, Primary Key): A unique identifier for each item.
- **title** (TEXT): The title/name of the item (e.g., the destination name).
- **description** (TEXT): A description of the item (e.g., a brief overview of the destination).

---

## **API Routes List (CRUD)**

### **GET /api/items**
- **Description**: Fetches all items from the database.
- **Returns**: An array of items sorted by `id` in ascending order.

### **GET /api/items/:id**
- **Description**: Fetches a single item by `id` from the database.
- **Parameters**: `id` (Number) — The ID of the item to fetch.
- **Returns**: A single item with the specified `id`.

### **POST /api/items**
- **Description**: Adds a new item to the database.
- **Body**: 
  - `title` (String) — The title of the item.
  - `description` (String) — The description of the item.
- **Returns**: The newly created item, including its assigned `id`.

### **PUT /api/items/:id**
- **Description**: Updates an existing item in the database by `id`.
- **Parameters**: 
  - `id` (Number) — The ID of the item to update.
  - **Body**: 
    - `title` (String) — The new title of the item.
    - `description` (String) — The new description of the item.
- **Returns**: The updated item.

### **DELETE /api/items/:id**
- **Description**: Deletes an item from the database by `id`.
- **Parameters**: `id` (Number) — The ID of the item to delete.
- **Returns**: A success message indicating the item has been deleted.

---

## **How to Run the Project**

### 1. **Clone the Repository**
   Clone the project to your local machine using:
   ```bash
   git clone <your-repository-url>

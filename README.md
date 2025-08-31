## Meal Reservation System:
The meal reservation system is a software platform where users (students) can reserve their meals (breakfast, lunch, and dinner) for the upcoming week before the week begins.
## Requirements:
### General Requirements

- [ ] The system must be **responsive** (usable on both desktop and mobile).
- [ ] The system must be **bilingual** (Persian and English), with Persian as the default.
- [ ] The design flow and layout must be **simple and user-friendly**.
- [ ] The system should include a **dashboard**.
---
Login Page:

- [x] Login page with two inputs: **username** and **password**.
- [ ] Must support **authentication** and include a **password recovery process**.
- [x] If incorrect information is entered (username/password), a **clear and well-styled error message** must be displayed.
- [ ] Announcements related to the meal system (e.g., holidays, service suspensions) must be visible on this page.
- [ ] Page should contain **relevant images** and have a clean layout.
- [x] Since there is no backend/database, user information and other entities will be **hardcoded in the source code**.
---
Reservation Features:
- [ ] Users can view the **weekly meal schedule**.
- [ ] Ability to **reserve or cancel reservations** for breakfast, lunch, and dinner.
- [ ] Option to **select dining location** (Self Location) (e.g., central cafeteria, dormitory cafeteria) after choosing a meal.
- [ ] Ability to **finalize meal reservations and pay** using a confirmation button.
- [ ] Each meal must include details such as:

	- Ingredients (e.g., _200g chicken, rice, yogurt, etc._)
    
	- **Calories** (numeric value)
    
	- **Image of the dish** (like a restaurant menu)

- [ ] Users can **enter discount codes** to reduce the price.
- [ ] Users can **view reserved items** after finalization and payment.
- [ ] Payment options after finalization:

	1. **Wallet balance** (pre-charged credit inside the system)
    
	2. **Direct payment** via online gateway

- [ ] Implementation of a **Faramushi password  feature** (e.g., generate a 5-digit code).
- [ ] Ability to reserve meals on the **same day (last-minute reserves)**.

---
Account Recharge Features:

- [ ] Users must be able to recharge their account with an **amount between 10,000 – 200,000 Tomans**.
- [ ] After successful payment through the gateway, the balance should be updated and the user redirected to the reservation page.

---
Other Features:

- [ ] Users can view their **reservation history**.
- [ ] Users can view their **transaction history** (recharges and direct payments).
- [ ] A **help section** (How to interact with the system) must be available.
- [ ] The **current date and time (Shamsi calendar)** must always be visible.

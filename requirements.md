## Software Requirements
### Vision
Minimum Length: 3-5 sentences

What is the vision of this product? 

App locates and tracks the International Space Station (ISS), in relation to the user's location, including local weather and visibility. Useful for hobbyiests and enthusiasts everywhere as it provides extra information for ham radio users and a fun facts page.

What pain point does this project solve?


To get people excited about Space, we propose an ISS tracking app. By logging in with name and city, we will use API data to provide the user with ISS pass times, altitude, and other factors of concern for their location. 


Why should we care about your product?

Our app allows the user to figure out where the ISS is with the click of a button.  It allows the user to plan when the best chance to view the ISS from their location. Bonus:  our app gets the user excited about the manned space program

### Scope (In/Out)
IN - What will your product do

- We have a database, ISS_Tracker, with one table,  savedTracker.  The table is used to save login name and city.

- Our app will use the Geocode API (reverse Geocode) when, given a city, and return lat/lon which will...

- Be fed into  API that, given lat/lon, returns ISS pass time and altitude

- We will use an API that will give the weather forecast for that location

- We also plan to provide nibblets of ISS-related information, such as astronaut bios, so the user has an enjoyable learning experience


OUT - What will your product not do.

- Our app will not be turned into an iOS or Android app

- Our app will not function as a reminder for upcoming passes (unless stretch goal happens where we connect to a 3rd party text messaging service)

- We won't predict whether ham radios can contact or not--the operator will need to use the info we provide and their own processes/judgement

### Minimum Viable Product vs
What will your MVP functionality be?

- Display a list of passes for user location

- Have a section giving altitude and freq in addition to pass times for radio enthusiasts

- Show weather forecast from API for +X days in relation to pass day

- Use responsive CSS

- Present user with the astronomy pic of the day

- Redirect to a page of astronaut bios, ISS layout, other news (API news feed)

What are your stretch goals?

### Stretch
What stretch goals are you going to aim for?

- Stretch: auto populate a calendar

- Stretch: trajectory map (easy is static; harder is animated); populate embedded window or link to other site

- Stretch: link to text msg alerts

- Stretch goal: list of space music clips (Space Odyssey, Close Encounters, etc) , movies etc

- Stretch: we will likely pull login name from the DB and display on the User Page (Basice and Radio) or in the Nav Partial on all pages to make the site more friendly.

- Stretch: we will likely pull login city when user revisits the page and confirm it's still applicable.

- Stretch: we may provide the user the ability to save Astronomy Pics of the Day urls as they wish.  This would be a separate table with user name and several slots (5, 8, 10?) for storing and retrieving URLs. Additional Stretch:  provide a page to view saved pics

### Functional Requirements
- A user can create an account
- A user can update the information stored in the account (e.g. city location and name)
- A user can search for present location of ISS
- A user can see the Astronomy Picture of the Day
- A user can see when the ISS will be closest to user's present location
- A user can delete account

### Data Flow
When the user arrives on the landing page, an account must be created, where name and location of the user is input into the database. User is directed to the basic User page, where the user may click a button accessing the present location of the ISS, and the present weather conditions for the location that was stored in the database.

The user may proceed to click on the link to the radio page, whereby the same data cycle may take place.

If the stretch goals are achieved, the user will be able to save favorite astronomy pictures into the database, and display them with the click of a button.

### Non-Functional Requirements (301 & 401 only)

- We are using official, open-source APIs and other sources for our NASA information to ensure accuracy.  This ensures accuracy, but more importantly serves as a one-stop combining many resources in one app.  For instance, the user can visit the Info page and see astronaut bios, live NASA news feeds, the picture of the day, and other collected info

- We are providing lots of "space splash" to provide an engaging and exciting experience.  Our purpose is to get people excited about Space, and we are using a flashy UI/UX to achieve this.


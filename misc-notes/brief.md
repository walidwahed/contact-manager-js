# Contact Manager Project
## Preparation for 249 Assessment

Requirements:
- Develop a contact manager application
- Utilize jQuery, localstorage, handlebars
- Create it in a pseudo-classical and in the OLOO pattern

Functionality
- Header
  - only text
- Functionality area
  - allows for adding contact
    - clicking create contact wipes up a contact form
  - search bar
    - with each keypress, filters the contact listing area
- Contact listing area
  - When empty, shows a no contacts message and "add contact button"
  - When contacts are present, lists them in order added
- Contact item
  - contact details are text
  - contains an edit and delete button
    - pressing edit wipes up an edit form similar to the create contact form
    - delete creates a confirmation alert that if approved deletes the contact
- Create contact form
- Footer
  - Just text and links

Style
- Animations for Add Contact, Edit, and subsequent Submit, Cancel
- All buttons have a hover color
- media query @ 770px

Approach
- Do up HTML and CSS first of all the elements
- Build out application logic without templates or local storage utilizing simple collections and hard coded HTML
- build out animations
- Extend with local storage and templates

Application Logic
- Need to initialize an application object
- Begin with a pseudo-classical approach, defining states in the constructor function, behaviors on the constructor's prototype
- Need a collection that will hold contact objects (really the only state related item I think I would need, since everything else will be behavior based)
- To initialize the application:
  - Need to register event listener on add contact
    - callback should bring up the add contact screen, hide all the other elements
  - Need to register event listener on edit and delete
    - edit callback should bring up edit screen, hide all the other elements
    - delete callback should prompt an alert on whether or not to delete an item, and update the collection and view appropriately
  - Need to register event listener on submit and cancel
    - submit callback should update the contact collection and refresh the view
  - Register event listener for keypress on search bar
    - should update the message if no match found
    - call the view renderer with the string
- Need a view renderer
  - Renders all the contacts in the collection
  - Can also render a subsection of the collection given a search string
  - Renders the no contact message if the collection is 

Still to do:
  - localstorage - ok
  - search query - ok
  - form validation - ok
  - animations - ok
  - handlebars - ok
  - media queries - ok

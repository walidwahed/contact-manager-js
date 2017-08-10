/*

OLOO pattern

var Object = {
  behaviors,
  defaultStates, // define default states on the prototype
  init: function () {
    states to establish and behaviors to execute when new objct is created
    return this // returns itself
  }
}

Object.create(object).init(); // if states other than the default ones are desired, they should be in the init method
// This is different from pseudo-classical pattern in that you can have the invocation of the constructor call `init` for you

*/


/*
Requirements

- User can add, edit, and delete contacts
  - Save and load contacts from localStorage
  - Every contact needs a unique id
  - All contacts contribute to a shared tag list which can be used to filter
- User can see all their contacts and filter them by search or tags
  - Need a contact renderer that will render what's in the current view
  - Render "no contacts" warning if no contacts found
  - Utilize an in-memory contacts cache that the filter can work off of without sending a request to local storage
  - Local storage should only update when a contact is added, edited, or deleted
  - Tag list should refresh with every change to localStorage
  - Tag list should be hidden if there are no tags
  - Query filter should issue warning if no matches found
  - Query filter should issue adjusted warning if tags are active and also filtering
  - (Therefore need hierarchy of filters -> tags first -> then query string)
- Create/edit form
  - Should display proper heading
  - Should animate in and out of view
  - Perform error checking on submit
- Event listeners needed for:
  - Add Contact - click -> brings up form, hides contacts
  - Edit - click -> same as add contact, except contact is pre-populated, and an edit id is present which will cause submission to overwrite the old version
  - Delete - click -> confirms action, updates cache, cache is saved to localStorage
  - Submit - click -> hides and clears form, updates cache, cache is saved to localStorage
  - Cancel - click -> hides and clears form, and return to standard view
  - Search bar - keyup -> sets current view to query string
  - Tags - clicks -> sets current view to tag filter
*/

/*
Build plan:
- Cache, id, and bindings
- Build out storage and ability for cache to work with it
- Ability to add, edit, delete items from cache
- View that pulls from cache (but can be modified)
- Caching mechanism (saves to storage when modified)
- View modications based on cache - search, tags
- Animations, hiding and showing different parts of the page

*/


// Application Object

// to the extent that functions have access to and modify internal state of the object, I want them as methods
// to the extent that they don't need access to the state, I want them external
// many can obviously be written to be inside or outside, just have to make the decision on where it makes the most sense
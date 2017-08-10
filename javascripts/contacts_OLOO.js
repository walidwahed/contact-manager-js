// jQuery Selectors

var $contactsView = $("#contacts_view"); // Default main view
var $tags = $("#tag_list"); // Tag list
var $contacts = $("#contacts"); // Contacts list
var $messages = $(".message"); // "No contacts" or "No search result message" messages
var $noContacts = $("#no_contacts"); // "No contacts" message
var $noMatch = $("#no_match"); // "No matching search result" message
var $contactFormView = $("#update_contact"); // Form view for creating or editing a contact
var $contactForm = $("form"); // The contact create/edit form itself
var $errors = $(".error"); // Form error messages
var $search = $("input[type=search]"); // Search bar

// Handlebars Templates

var tagTemplate = Handlebars.compile($("#tags_template").html());
var contactTemplate = Handlebars.compile($("#contact_template").html());
var matchTemplate = Handlebars.compile($("#match_template").html());

// Storage

function loadFromStorage() {
  return JSON.parse(localStorage.getItem("contacts"));
}

function saveToStorage(contacts) {
  localStorage.setItem("contacts", JSON.stringify(contacts));
}

// Utility

function findId(event) {
  return $(event.target).closest("li").data("id");
}

function parseTags(string) {
  if (!string) {
    return null;
  }

  var tags = string.split(",").map(function(tag) {
    return tag.trim();
  });

  return removeDuplicateTags(tags);
}

function removeDuplicateTags(tags) {
  var unique = [];

  tags.forEach(function(tag) {
    if (unique.indexOf(tag) < 0) {
      unique.push(tag);
    }
  });

  return unique;
}

function prepareTagList(tags, active) {
  var tagList = [];

  tags.forEach(function(tag) {
    if (active.indexOf(tag) < 0) {
      tagList.push({ tag: tag });
    } else {
      tagList.push({ tag: tag, active: true });
    }
  });

  return tagList;
}

// View Updates

function showError(field) {
  $("#" + field + "_error").show();
  $("label[for=" + field + "]" ).addClass("has_error");
  $("input#" + field ).addClass("has_error");
}

function hideError(field) {
  $("#" + field + "_error").hide();
  $("label[for=" + field + "]" ).removeClass();
  $("input#" + field ).removeClass();
}

function hideForm() {
  $contactFormView.hide();
}

function hideMessages() {
  $messages.hide();
}

function prepareNoMatchMessages(tags, query) {
  var criteria = {
    tags: tags.join(", "),
    search: query
  };

  $noMatch.children().remove();
  $noMatch.append($(matchTemplate(criteria)));
}

function refreshContactsView(contacts, tags) {
  $tags.children().remove();
  $tags.append(tagTemplate({ tags: tags }));
  contacts.map(function(contact) {
    contact.tags = contact.tags.join(", ");
    return contact;
  });
  $contacts.children().remove();
  $contacts.append(contactTemplate({ contacts: contacts }));
  contacts.map(function(contact) {
    contact.tags = contact.tags.split(", ");
    return contact;
  });
}

function clearForm() {
  $contactForm.find("input[type=text]").val("");
  $contactForm.find("input[type=email]").val("");
  $errors.hide();
}

function populateForm(contact) {
  for (var field in contact) {
    $("#" + field).val(contact[field]);
  }
}

function revealFormView() {
  $contactsView.slideUp();
  $contactFormView.slideDown();
  $contactsView.after($contactFormView);
}

function revealContactsView() {
  $contactFormView.slideUp();
  $contactsView.slideDown();
  $contactFormView.after($contactsView);
}

// Application Object

var ContactsManager = {
  // Default States
  nextId: 1,
  contactsCache: [],
  filteredContacts: [],
  tagContacts: [],
  searchContacts: [],
  currentContact: null,
  inputs: null,
  editId: null,
  tagList: [],
  activeTags: [],
  query: "",

  // Utility
  noContacts: function() {
    return this.contactsCache.length === 0;
  },
  noMatches: function() {
    return !this.noContacts() && this.filteredContacts.length === 0;
  },
  findCurrentIndex: function() {
    var index;

    this.contactsCache.some(function(contact, idx) {
      index = idx;
      return contact.id === this.editId;
    }, this);

    return index;
  },
  setIdToSelected: function(e) {
    this.editId = findId(e);
  },
  setCurrentContact: function() {
    this.currentContact = this.contactsCache[this.findCurrentIndex()];
  },
  refreshActiveTags: function(tags) {
    this.activeTags.forEach(function(tag, index) {
      if (tags.indexOf(tag) < 0) {
        this.activeTags.splice(index, 1);
      }
    }, this);
  },
  refreshTagList: function() {
    var tags = [];

    this.contactsCache.forEach(function(contact) {
      tags = tags.concat(contact.tags);
    });

    tags = removeDuplicateTags(tags);
    this.refreshActiveTags(tags);
    this.tagList = prepareTagList(tags, this.activeTags);
  },

  // Render View Organizer
  renderContacts: function() {    
    hideMessages();
    this.refreshTagList();
    this.refreshContactsFilter();

    if (this.noContacts()) {
      $noContacts.show();
    }

    if (this.noMatches()) {
      prepareNoMatchMessages(this.activeTags, this.query);
      $noMatch.show();
    }
    
    refreshContactsView(this.filteredContacts, this.tagList);
  },

  // Change View Event Handlers 
  add: function(e) {
    e.preventDefault();
    clearForm();
    revealFormView();
    this.editId = null;
  },
  edit: function(e) {
    e.preventDefault();
    clearForm();
    this.setIdToSelected(e);
    this.setCurrentContact();
    populateForm(this.currentContact);
    revealFormView();
  },
  cancel: function(e) {
    e.preventDefault();
    this.renderContacts();
    revealContactsView();
  },

  // View Manipulation - Tags and Searches
  filterContactsByTag: function() {
    if (this.activeTags.length === 0) {
      this.tagContacts = this.contactsCache;
      return;
    }

    var filtered = [];

    this.contactsCache.forEach(function(contact) {
      if (this.activeTags.every(function(tag) { return contact.tags.indexOf(tag) >= 0; })) {
      filtered.push(contact);
      }
    }, this);

    this.tagContacts = filtered;
  },
  filterContactsBySearch: function() {
    if (!this.query) {
      this.searchContacts = this.contactsCache;
      return;
    }

     var filtered = []
     var criteria = new RegExp(this.query, 'i');

     this.contactsCache.forEach(function(contact) {
      if (contact.name.match(criteria)) {
        filtered.push(contact);
      }
    });

    this.searchContacts = filtered;
  },
  setFilteredToCommon: function() {
    var filtered = this.tagContacts.filter(function(tagContact) {
      return this.searchContacts.some(function(searchContact) {
        return tagContact.id === searchContact.id;
      });
    }, this);
    this.filteredContacts = filtered;
  },
  refreshContactsFilter: function() {
    this.filterContactsByTag();
    this.filterContactsBySearch();
    this.setFilteredToCommon();
  },
  searchFilter: function(e) {
    this.query = $(e.target).val();
    this.renderContacts();
  },
  removeFromActiveTags: function(tag) {
    var index = this.activeTags.indexOf(tag.text());
    this.activeTags.splice(index, 1);
  },
  addToActiveTags: function(tag) {
    this.activeTags.push(tag.text());
  },
  tagFilter: function(e) {
    var $tag = $(e.target);

    if ($tag.hasClass("active")) {
      $tag.removeClass("active");
      this.removeFromActiveTags($tag);
    } else {
      $tag.addClass("active");
      this.addToActiveTags($tag);
    }

    this.renderContacts();
  },

  // Form Validation
  foundErrors: function() {
    var errorFound = false;

    for (var field in this.currentContact) {
      if (!this.currentContact[field]) {
        showError(field);
        errorFound = true;
      } else {
        hideError(field);
      }
    }

    return errorFound;
  },

  // Contact Manipulation and Storage
  buildContact: function() {
    var contact = {};
    contact.id = this.editId ? this.editId : this.nextId++;
    this.inputs.forEach(function(field) {
      contact[field.name] = field.value;
    });

    contact.tags = parseTags(contact.tags);
    this.currentContact = contact;
  },
  addContactToCache: function() {
    if (this.editId) {
      this.contactsCache.splice(this.findCurrentIndex(), 1, this.currentContact);
    } else {
      this.contactsCache.push(this.currentContact);
    }
  },
  removeContactFromCache: function() {
    this.contactsCache.splice(this.findCurrentIndex(), 1);
  },
  sortCacheById: function() {
    this.contactsCache.sort(function(a, b) {
      return a.id - b.id;
    });
  },
  saveContact: function() {
    this.addContactToCache();
    this.sortCacheById();
    saveToStorage(this.contactsCache);
  },

  // Contact Manipulation Event Handlers
  submit: function(e) {
    e.preventDefault();
    this.inputs = $contactForm.serializeArray();
    this.buildContact();
    
    if (this.foundErrors()) {
      return;
    }

    this.saveContact();
    this.renderContacts();
    revealContactsView();
  },
  delete: function(e) {
    e.preventDefault();
    this.setIdToSelected(e);
    var deleteAction = confirm("Delete '" + this.contactsCache[this.findCurrentIndex()].name + "'?");
    
    if (deleteAction) {
      this.removeContactFromCache();
      saveToStorage(this.contactsCache);
    }

    this.renderContacts();
  },

  // Application Setup
  loadContacts: function() {
    if (!loadFromStorage()) {
      return;
    }

    this.contactsCache = loadFromStorage();
  },
  findNextId: function() {
    if (this.noContacts()) {
      return;
    } 

    var largestId = this.contactsCache.reduce(function(id, contact) {
      return contact.id > id ? contact.id : id;
    }, this.nextId);

    this.nextId = largestId + 1;
    // id count would only reset if all contacts are deleted
    // if not resetting this was desirable, would save the last used id to localStorage and retrieve as part of load
  },
  bind: function() {
    $(document).on("click", ".add", this.add.bind(this));
    $(document).on("click", ".edit", this.edit.bind(this));
    $(document).on("click", ".delete", this.delete.bind(this));
    $(document).on("submit", $contactForm, this.submit.bind(this));
    $(document).on("click", ".cancel", this.cancel.bind(this));
    $(document).on("click", ".tag", this.tagFilter.bind(this));
    $search.on("keyup", this.searchFilter.bind(this));

  },
  init: function() {
    this.loadContacts();
    this.refreshTagList();
    this.findNextId();
    this.bind();
    this.renderContacts();
    hideForm();
    return this;
  }
}

// Initialization

var contacts = Object.create(ContactsManager).init();
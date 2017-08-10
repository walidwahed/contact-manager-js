var $main = $("main");
var $home = $("#home");
var $contacts = $("#contacts");
var $messages = $(".message");
var $noMatch = $("#no_match");
var $noContact = $("#no_contacts");
var $updateContact = $("#update_contact");
var $form = $("form");
var $errors = $(".error");


function ContactManager() {
  this.contacts = [];
  this.nextContactID = 1;
  this.init();
};

ContactManager.prototype = {

  findIndex: function() {
    for (var i = 0; i < this.contacts.length; i++) {
      if (this.contacts[i].id === this.editId) {
        break;
      }
    }

    return i;
  },
  createContact: function(formValues) {
    var name;
    var email;
    var phone;
    var id;

    if (this.editId) {
      id = this.editId;
    } else {
      id = this.nextContactID++;
    }

    formValues.forEach(function(object) {
      if (object.name === "name") {
        name = object.value;
      }

      if (object.name === "email") {
        email = object.value;
      }

      if (object.name === "phone") {
        phone = object.value;
      }
    });

    return {
      id: id,
      name: name,
      email: email,
      phone: phone
    };
  },
  getContacts: function() {
    this.contacts = JSON.parse(localStorage.getItem("contacts"));
  },
  setContacts: function() {
    localStorage.setItem("contacts", JSON.stringify(this.contacts));
  },
  haveSavedContacts: function() {
    var loadedContacts = JSON.parse(localStorage.getItem("contacts"));
    if (!!loadedContacts) {
      return loadedContacts.length > 0;
    } else {
      return false;
    }
  },
  noContacts: function() {
    return this.contacts.length === 0;
  },
  noResults: function() {
    return this.filtered && this.contacts.length === 0;
  },
  addToContacts: function(contact) {
    this.getContacts();
    if (this.editId) {
      this.contacts.splice(this.findIndex(), 1, contact);
    } else {
      this.contacts.push(contact);
    }
    this.setContacts();
  },
  deleteContact: function(id) {
    this.getContacts();
    this.contacts.splice(this.findIndex(), 1);
    this.setContacts();
  },
  // Don't need below if using templating
  // contactDetail: function(contact) {
  //   var $name = $("<h2 />").text(contact.name);
  //   var $phone = $("<dd />").text(contact.phone);
  //   var $email = $("<dd />").text(contact.email);
  //   var $details = $("<dl />");
  //   $details.append("<dt>Phone Number:</dt>")
  //           .append($phone)
  //           .append("<dt>Email:</dt>")
  //           .append($email);
  //   var $contact = $("<li />");
  //   $contact.addClass("contact").data("id", contact.id);
  //   $contact.append($name).append($details).append('<a href="#" class="button edit">Edit</a><a href="#" class="button delete">Delete</a>');
  //   return $contact;
  // },
  renderContacts: function() {
    $contacts.hide();
    $messages.hide();

    if (this.noResults()) {
      $noMatch.find("strong").text(this.query);
      $noMatch.show();
    }

    if (!this.haveSavedContacts()) {
      $noContact.show();
    } else {
      $(".contact").remove();
      $contacts.append(this.contactTemplate({ contacts: this.contacts }));

      // previous code using non-looping template and manual javascript to create html
      // for (var i = 0; i < this.contacts.length; i++) {
        // var contact = this.contacts[i];
        // $contacts.append(this.contactDetail(contact)); // manual JS version
        // $contacts.append(this.contactTemplate(contact)); // manual template version
      // }

      $contacts.show();
    }
  },
  clearErrors: function() {
    $errors.hide();
    $(".has_error").removeClass();
  },
  showUpdate: function() {
    this.clearErrors();
    $home.slideUp();
    $updateContact.appendTo($main);
    $updateContact.slideDown();
  },
  hideUpdate: function(slide) {
    if (slide === "none") {
      $updateContact.hide();
      return;
    }

    $updateContact.slideUp();
    $home.appendTo($main);
    $home.slideDown();
  },
  clearForm: function() {
    $form.find("input[type=text]").val("");
    $form.find("input[type=email]").val("");
  },
  populateFields: function(details) {
    $("input#name").val(details.name);
    $("input#email").val(details.email);
    $("input#phone").val(details.phone);
  },
  errorCheck: function(object) {
    ["name", "email", "phone"].forEach(function(type) {
      if (object.name === type) {
        if (!object.value) {
          $("." + type + "_error").show();
          $("label[for=" + type + "]").addClass("has_error");
          $("#" + type).addClass("has_error");
          this.formErrorDetected = true;
        } else {
          $("." + type + "_error").hide();
        }
      }
    }, this);
  },
  formError: function(formValues) {
    this.formErrorDetected = false;
    this.clearErrors();
    formValues.forEach(this.errorCheck, this); // Remember to be mindful of context when executing callbacks!
    return this.formErrorDetected;
  },
  add: function(e) {
    e.preventDefault();
    
    $updateContact.find("h2").text("Create Contact");
    this.editId = false;
    this.showUpdate();
  },
  edit: function(e) {
    e.preventDefault();
    
    $updateContact.find("h2").text("Edit Contact");
    this.editId = $(e.target).closest("li").data("id");
    var details = this.contacts[this.findIndex()];
    this.populateFields(details);
    this.showUpdate();
  },
  delete: function(e) {
    e.preventDefault();

    var $target = $(e.target).closest("li");
    var name = $target.find("h2").text();
    this.editId = $target.data("id"); 
    var action = confirm("Do you want to delete " + name +"?");

    if (action) {
      this.deleteContact();
    }

    this.renderContacts();
  },
  submit: function(e) {
    e.preventDefault();
    
    var formValues = $form.serializeArray();
    if (this.formError(formValues)) {
      return;
    }

    var contact = this.createContact(formValues);
    this.addToContacts(contact);
    this.clearForm();
    this.hideUpdate();
    this.renderContacts();
  },
  cancel: function(e) {
    e.preventDefault();

    this.clearForm();
    this.hideUpdate();
    this.renderContacts();
  },
  filterContacts: function() {
    if (this.query === "") {
      this.filtered = false;
      return;
    }

    var filteredContacts = [];

    for (var i = 0; i < this.contacts.length; i++) {
      var test = new RegExp(this.query, "i");
      if (this.contacts[i].name.match(test)) {
        filteredContacts.push(this.contacts[i]);
      }
    }

    this.filtered = true;
    this.contacts = filteredContacts;
  },
  search: function(e) {
    this.query = $(e.target).val();
    this.getContacts();
    this.filterContacts();
    this.renderContacts();
  },
  findNextId: function() {
    if (!this.haveSavedContacts()) {
      return this.nextContactID;
    } 

    var largestId = 0;

    for (var i = 0; i < this.contacts.length; i++) {
      if (this.contacts[i].id > largestId) {
        largestId = this.contacts[i].id;
      }
    }

    return largestId + 1;
  },
  setNextId: function() {
    this.nextContactID = this.findNextId();
  },
  loadLocalStorage: function() {
    if (this.haveSavedContacts()) {
      this.getContacts();
    }
    this.setContacts();
  },
  prepareTemplate: function() {
    var $contactTemplate = $("#contact_template");
    this.contactTemplate = Handlebars.compile($contactTemplate.html());
    $contactTemplate.remove();
  },
  bindListeners: function() {
    $(document).on("click", ".add", this.add.bind(this));
    $(document).on("click", ".edit", this.edit.bind(this));
    $(document).on("click", ".delete", this.delete.bind(this));
    $(document).on("submit", $form, this.submit.bind(this));
    $(document).on("click", ".cancel", this.cancel.bind(this));
    $(document).on("keyup", "input[type=search]", this.search.bind(this));
  },
  init: function() {
    this.bindListeners();
    this.hideUpdate("none");
    this.loadLocalStorage();
    this.prepareTemplate();
    this.setNextId();
    this.renderContacts();
  }
}

new ContactManager();
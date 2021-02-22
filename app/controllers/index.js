const Multer    = require('multer');
const Upload    = Multer({ dest: "uploads/", preservePath: true});
const Papa      = require('papaparse');
const fs        = require('fs');
const contacts  = JSON.parse(fs.readFileSync("contacts.json"));

module.exports = function(router) {
  router.get("/", async function(req, res) {
    res.render("index", { title: "Home", contacts: contacts });
  });

  router.post("/contacts", Upload.single("file"), async function(req, res) {
    const file = fs.readFileSync(req.file.path, {
      encoding: 'utf8'
    });

    if(!contacts.Tags)
      contacts.Tags = {};

    Papa.parse(file, {
      header: true,
      worker: true,
      step: function(row, parser) {
        parser.pause();
        contacts[row.data.PhoneNumber] = row.data;
        const tags = row.data.Tags.split(",")
        for(const tag of tags)
          contacts.Tags[tag] = 1;
        parser.resume();
      },
      complete: function(result) {
        fs.writeFileSync("contacts.json", JSON.stringify(contacts));
        fs.unlinkSync(req.file.path);
        res.redirect("/");
      }
    });
  });

  router.post("/sendmessages", async function(req, res) {
    const twilio = require('twilio')(ENV.TWILIO_ACCOUNT_SID, ENV.TWILIO_AUTH_TOKEN);
    const tags_included = req.body.tags;
    const list = [];
    for(const key in contacts) {
      let doInclude = true;
      const contact = contacts[key];
      if(contact.Tags) {
        const tags = contact.Tags.split(",");
        for(const tag of tags_included) {
          if(tags.indexOf(tag) < 0)
            doInclude = false;
        }
        if(doInclude)
          list.push(contact);
      }
    }

    for(const contact of list) {
      twilio.messages
      .create({body: req.body.message, from: ENV.MESSAGING_SERVICE_SID, to: contact.PhoneNumber})
      .then(message => console.log(message.sid));
    }
    res.send({success: true, list: list});
  });
};

const Desklet = imports.ui.desklet;
const St = imports.gi.St;
const Soup = imports.gi.Soup;
const Lang = imports.lang;
const Mainloop = imports.mainloop;
const Settings = imports.ui.settings;

const httpSession = new Soup.SessionAsync();
Soup.Session.prototype.add_feature.call(httpSession, new Soup.ProxyResolverDefault());

function GitHubNotificationsDesklet(metadata, desklet_id) {
    this._init(metadata, desklet_id);
}

GitHubNotificationsDesklet.prototype = {
    __proto__: Desklet.Desklet.prototype,

    _init: function(metadata, desklet_id) {
        Desklet.Desklet.prototype._init.call(this, metadata, desklet_id);

        // Initialize settings
        this.settings = new Settings.DeskletSettings(this, metadata.uuid, desklet_id);
        this.settings.bind('github-token', 'githubToken', this.onSettingsChanged);
        this.settings.bind('refresh-interval', 'refreshInterval', this.onSettingsChanged);

        this.setupUI();
        this.fetchData(true);
    },

    setupUI: function() {
        this.container = new St.BoxLayout({ vertical: true, style_class: 'container' });
        this.label = new St.Label({ text: "Loading notifications..." });
        this.container.add(this.label);
        this.setContent(this.container);
    },

    fetchData: function(initUI = false) {
        if (!this.githubToken) {
            this.label.set_text('GitHub Token not set.');
            return;
        }

        let url = "https://api.github.com/notifications";
        let message = Soup.Message.new('GET', url);
        message.request_headers.append('Authorization', 'token ' + this.githubToken);
        message.request_headers.append('User-Agent', 'GitHub Desklet/1.0');

        httpSession.queue_message(message, Lang.bind(this, function(session, response) {
            if (response.status_code === 200) {
                let data = JSON.parse(response.response_body.data);
                this.label.set_text('GitHub notifications: ' + data.length);
            } else {
                this.label.set_text('Error loading notifications: Status ' + response.status_code);
                global.log('Error: ' + response.status_code + ' - ' + response.response_body.data);
            }
        }));

        if (initUI && this.refreshInterval) {
            if (this.mainloop) {
                Mainloop.source_remove(this.mainloop);
            }
            this.mainloop = Mainloop.timeout_add_seconds(this.refreshInterval, Lang.bind(this, this.fetchData));
        }
    },

    onSettingsChanged: function() {
        this.fetchData(true);
    },

    on_desklet_removed: function() {
        if (this.mainloop) {
            Mainloop.source_remove(this.mainloop);
        }
    }
};

function main(metadata, desklet_id) {
    return new GitHubNotificationsDesklet(metadata, desklet_id);
}

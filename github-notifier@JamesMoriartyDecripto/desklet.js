const Desklet = imports.ui.desklet;
const St = imports.gi.St;
const Soup = imports.gi.Soup;
const Lang = imports.lang;
const Mainloop = imports.mainloop;
const Settings = imports.ui.settings;
const Clutter = imports.gi.Clutter;

const httpSession = new Soup.SessionAsync();
Soup.Session.prototype.add_feature.call(httpSession, new Soup.ProxyResolverDefault());

function GitHubNotificationsDesklet(metadata, desklet_id) {
    this._init(metadata, desklet_id);
}

GitHubNotificationsDesklet.prototype = {
    __proto__: Desklet.Desklet.prototype,

    _init: function(metadata, desklet_id) {
        Desklet.Desklet.prototype._init.call(this, metadata, desklet_id);

        this.settings = new Settings.DeskletSettings(this, metadata.uuid, desklet_id);
        this.settings.bind('github-token', 'githubToken', this.onSettingsChanged);
        this.settings.bind('refresh-interval', 'refreshInterval', this.onSettingsChanged);
        this.settings.bind('notification-display-mode', 'notificationDisplayMode', this.onSettingsChanged);
        this.settings.bind('notification-count', 'notificationCount', this.onSettingsChanged);
        this.settings.bind('background-color', 'backgroundColor', this.onSettingsChanged);
        this.settings.bind('text-color', 'textColor', this.onSettingsChanged);
        this.settings.bind('border-color', 'borderColor', this.onSettingsChanged);
        this.settings.bind('border-width', 'borderWidth', this.onSettingsChanged);



        this.setupUI();
        this.fetchData(true);
    },

    setupUI: function() {
        this.container = new St.BoxLayout({ vertical: true, style_class: 'container' });
        this.container.set_reactive(true);
        this.container.connect('scroll-event', Lang.bind(this, this._onScrollEvent));
        this.label = new St.Label({ text: "Loading notifications..." });
        this.container.add(this.label);
        this.setContent(this.container);
    
        this.displayedNotifications = [];
        this.notificationOffset = 0;
        this.updateStyles();  // Applica gli stili iniziali
    },
    
    updateStyles: function() {
        // Log per confermare i valori
        global.log("Updating styles with BG color: " + this.backgroundColor + ", Border Color: " + this.borderColor + ", Border Width: " + this.borderWidth);
    
        this.container.style = "background-color: " + this.backgroundColor + 
                               "; border: " + this.borderWidth + "px solid " + this.borderColor + 
                               "; border-radius: 8px; padding: 10px;";
        this.applyTextStyles();
    },
    
    
    
    

    _onScrollEvent: function(actor, event) {
        let direction = event.get_scroll_direction();
        if (direction === Clutter.ScrollDirection.UP) {
            this._scrollUp();
        } else if (direction === Clutter.ScrollDirection.DOWN) {
            this._scrollDown();
        }
    },

    _scrollUp: function() {
        if (this.notificationOffset > 0) {
            this.notificationOffset -= this.notificationCount;
            this.updateDisplayedNotifications();
        }
    },

    _scrollDown: function() {
        if (this.notificationOffset < this.displayedNotifications.length - this.notificationCount) {
            this.notificationOffset += this.notificationCount;
            this.updateDisplayedNotifications();
        }
    },

    displayNotifications: function(data) {
        this.container.remove_all_children();
        this.displayedNotifications = data;
        
        this.updateDisplayedNotifications();
    },

    updateDisplayedNotifications: function() {
        this.container.remove_all_children();
        if (this.notificationDisplayMode === "count-only") {
            this.label = new St.Label({ text: `GitHub notifications: ${this.displayedNotifications.length}` });
            this.container.add(this.label);
        } else if (this.notificationDisplayMode === "list-recent") {
            this.displayedNotifications.slice(this.notificationOffset, this.notificationOffset + this.notificationCount).forEach(notification => {
                let detailLabel = new St.Label({ 
                    text: `${notification.reason}: ${notification.subject.title} - ${notification.repository.full_name}`, 
                    style_class: 'notification-detail' 
                });
                this.container.add(detailLabel);
            });
            if (this.notificationOffset > 0) {
                this.container.insert_child_at_index(new St.Label({ text: "Scroll up for more", style_class: 'scroll-indicator' }), 0);
            }
            if (this.notificationOffset < this.displayedNotifications.length - this.notificationCount) {
                this.container.add(new St.Label({ text: "Scroll down for more", style_class: 'scroll-indicator' }));
            }
        }
        // Apply styles after adding text elements
        this.applyTextStyles();
    },
    
    applyTextStyles: function() {
        let textElements = this.container.get_children();
        for (let elem of textElements) {
            elem.style = "color: " + this.textColor + ";";
        }
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
                this.displayNotifications(data);
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
        this.updateStyles();  // Aggiorna gli stili con le nuove impostazioni
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

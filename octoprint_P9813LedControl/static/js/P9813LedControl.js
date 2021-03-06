$(function () {
    function P9813LedControlStatusViewModel(parameters) {
        var self = this;
        self.settingsViewModel = parameters[0];
        self.printerStateModel = parameters[1];

        self.torch_enabled = ko.observable(true);

        var light_icon = $("#lightIcon");
        var switch_icon = $("#toggleSwitch");
        var torch_icon = $("#torchIcon");

        setInterval(updateButtonStates, 5000);

        function updateButtonStates() {
            OctoPrint.simpleApiCommand("P9813LedControl", "get_status").done(
                update_light_status
            );
        }

        function update_light_status(response) {
            if (response.lights_status) {
                light_icon.addClass("text-warning");
                switch_icon.addClass("fa-toggle-on text-warning");
            } else {
                light_icon.removeClass("text-warning");
                switch_icon
                    .removeClass("fa-toggle-on text-warning")
                    .addClass("fa-toggle-off");
            }
            if (response.torch_status) {
                torch_icon.addClass("text-warning");
            } else {
                torch_icon.removeClass("text-warning");
            }
        }

        self.toggle_lights = function () {
            OctoPrint.simpleApiCommand("P9813LedControl", "toggle_lights").done(
                update_light_status
            );
        };

        self.activate_torch = function () {
            var torch_time = self.settingsViewModel.settings.plugins.P9813LedControl.torch_timer();
            OctoPrint.simpleApiCommand(
                "P9813LedControl",
                "activate_torch"
            ).done(update_light_status);
            setTimeout(
                self.updateButtonStates,
                parseInt(torch_time, 10) * 1000
            );
        };

        self.onBeforeBinding = function () {
            self.torch_enabled(
                self.settingsViewModel.settings.plugins.P9813LedControl.torch_enabled()
            );
        };

        self.onStartupComplete = function () {
            self.printerStateModel.onEventPrinterStateChanged = function () {
                updateButtonStates();
            };
        };
    }

    OCTOPRINT_VIEWMODELS.push({
        construct: P9813LedControlStatusViewModel,
        dependencies: ["settingsViewModel", "printerStateViewModel"],
        elements: ["#navbar_plugin_P9813LedControl"],
    });
});

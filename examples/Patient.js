Core.registerEventPoint('Patient_GotIll');

Core.registerEventPoint('Patient_Recovered');

var Patient = {
    goToDoctor: function() {
        CatchEvent(Patient_FeelBad);

        console.log('done!');

        FireEvent(new Patient_GotIll({ symptoms: [] }));
    }
};

Core.processNamespace(window);
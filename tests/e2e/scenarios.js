'use strict';

describe('illuminati app', function() {

  beforeEach(function() {
    browser.get('');
  });
  describe('Schedule list', function() {
    it('should allow the user to create and remove schedules', function() {

      var addSchedule = element(by.css('.addSchedule'));
      var saveSchedule = element(by.css('.saveSchedule'));
      var scheduleList = element.all(by.repeater('schedule in schedules'));
      var scheduleLabel = element(by.model('label'));
      var testLabel = 'Test ' + Date().toString();

      // Run through the steps to create a new schedule.
      protractor.promise.all([
        scheduleList.count(),
        addSchedule.click(),
        scheduleLabel.sendKeys(testLabel),
        saveSchedule.click(),
        scheduleList.count(),
        scheduleList
      ]).then(function(steps) {
        // Creating a new schedule should increment the size of the list by 1.
        expect(steps[4]).toEqual(steps[0] + 1);

        // The final schedule in the list should be the one we just created.
        var schedules = steps[5];
        var lastSchedule = schedules[schedules.length - 1]
        var label = lastSchedule.element(by.css('.scheduleLabel'));
        var time = lastSchedule.element(by.css('.scheduleCronTime'));
        var transTime = lastSchedule.element(by.css('.scheduleTransTime'));

        // Check that label, cron time and trans time were set correctly.
        expect(label.getText()).toEqual(testLabel);
        expect(time.getText()).toEqual('Time: 12:00');
        expect(transTime.getText()).toEqual('Transition time: 0');

        // Run through the steps to delete the new schedule.
        var deleteSchedule = element.all(by.css('.delSchedule'));
        protractor.promise.all([
          lastSchedule.element(by.css('ul')).click(),
          deleteSchedule.click(),
          scheduleList.count()
        ]).then(function(delSteps) {
          // The final count of schedules should match the original count.
          expect(delSteps[2]).toEqual(steps[0]);
        });
      });
    });
  });
});

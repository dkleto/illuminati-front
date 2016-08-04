'use strict';

describe('illuminati app', function() {

  beforeEach(function() {
    browser.get('');
  });
  describe('Schedule list', function() {
    it('should allow the user to create schedules', function() {

      var addSchedule = element(by.css('.addSchedule'));
      var saveSchedule = element(by.css('.saveSchedule'));
      var scheduleList = element.all(by.repeater('schedule in schedules'));
      var scheduleLabel = element(by.model('label'));

      scheduleList.count().then(function(count) {
          addSchedule.click();
          var testLabel = 'Test ' + Date().toString();
          scheduleLabel.sendKeys(testLabel);
          saveSchedule.click();
          expect(scheduleList.count()).toEqual(count + 1);

          // The final schedule in the list should be the one we just created.
          scheduleList.then(function(schedules) {
            // Check that label, cron time and trans time were set correctly.
            var lastSchedule = schedules[schedules.length - 1]
            var label = lastSchedule.element(by.css('.scheduleLabel'));
            var time = lastSchedule.element(by.css('.scheduleCronTime'));
            var transTime = lastSchedule.element(by.css('.scheduleTransTime'));

            expect(label.getText()).toEqual(testLabel);
          });
      });
    });
  });
});

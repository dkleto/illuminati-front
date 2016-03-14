'use strict';

var color = angular.module('illuminatiServices', []);

color.factory('Color', [function() {
  var color = {};
  color.xyPoint = function(x, y) {
    // Check that x and y are both positive integers.
    function checkVal(val) {
      if (typeof val !== 'number') {
        throw new Error('"' + val + '" is not an integer');
      }
      if (val > 1 || val < -1) {
        throw new Error('"' + val + '" is not an integer between -1 and 1');
      }
    }
    checkVal(x);
    checkVal(y);
    return {'x' : x, 'y': y};
  };
  color.xyToRgb = function(point, gamut) {
    var z = 1 - point.x - point.y;
    var Y = 1;
    var X = (Y / point.y) * point.x;
    var Z = (Y / point.y) * z

    // Convert to linear rgb.
    var r =  X * 1.656492 - Y * 0.354851 - Z * 0.255038;
    var g = -X * 0.707196 + Y * 1.655397 + Z * 0.036152;
    var b =  X * 0.051713 - Y * 0.121364 + Z * 1.011530;

    var maxComponent = Math.max((Math.max(r, g), b));

    if (maxComponent > 1.0) {
            r /= maxComponent;
            g /= maxComponent;
            b /= maxComponent;
    }

    // Apply companding.
    r = r <= 0.0031308 ? 12.92 * r : 1.055 * Math.pow(r, (1 / 2.4)) - 0.055;
    g = g <= 0.0031308 ? 12.92 * g : 1.055 * Math.pow(g, (1 / 2.4)) - 0.055;
    b = b <= 0.0031308 ? 12.92 * b : 1.055 * Math.pow(b, (1 / 2.4)) - 0.055;

    r = color.bound(r);
    g = color.bound(g);
    b = color.bound(b);

    return {'r' : r, 'g' : g, 'b' : b};
  };
  color.rgbToHex = function(r, g, b) {
    var numToHex = function(number) {
      var result;
      result = Math.floor(Math.round(number * 255) / 16).toString(16);
      result += (Math.round(number * 255) % 16).toString(16);
      return result;
    }
    return ('#' + numToHex(r) + numToHex(g) + numToHex(b)).toUpperCase();
  };
  color.crossProduct = function(p1, p2) {
    return (p1.x * p2.y - p1.y * p2.x);
  };
  color.pointInGamut = function(point, gamut) {

    var v1 = color.xyPoint(gamut.g.x - gamut.r.x, gamut.g.y - gamut.r.y);
    var v2 = color.xyPoint(gamut.b.x - gamut.r.x, gamut.b.y - gamut.r.y);

    var q = color.xyPoint(point.x - gamut.r.x, point.y - gamut.r.y);

    var s = color.crossProduct(q, v2) / color.crossProduct(v1, v2);
    var t = color.crossProduct(v1, q) / color.crossProduct(v1, v2);

    if ( (s >= 0.0) && (t >= 0.0) && (s + t <= 1.0)) {
      return true;
    }
    else {
      return false;
    }
  };
  color.closestPointOnLine = function(v1, v2, point) {
    var v1p = color.xyPoint(point.x - v1.x, point.y - v1.y);
    var v1v2 = color.xyPoint(v2.x - v1.x, v2.y - v1.y);
    var v1v22 = v1v2.x * v1v2.x + v1v2.y * v1v2.y;
    var v1p_v1v2 = v1p.x * v1v2.x + v1p.y * v1v2.y;
    var t = v1p_v1v2 / v1v22;

    if (t < 0) {
      t = 0;
    }
    else if (t > 1) {
      t = 1;
    }

    var newPoint = color.xyPoint(v1.x + v1v2.x * t, v1.y + v1v2.y * t);
    return newPoint;
  };
  color.distanceBetweenPoints = function(p1, p2) {
    var dx = p1.x - p2.x; // horizontal difference
    var dy = p1.y - p2.y; // vertical difference
    var dist = Math.sqrt(dx * dx + dy * dy);

    return dist;
  };
  color.closestPointInGamut = function (point, gamut) {
    // Find the closest point on each line in the triangle.
    var pAB = color.closestPointOnLine(gamut.r, gamut.g, point);
    var pAC = color.closestPointOnLine(gamut.b, gamut.r, point);
    var pBC = color.closestPointOnLine(gamut.g, gamut.b, point);

    var dAB = color.distanceBetweenPoints(point, pAB);
    var dAC = color.distanceBetweenPoints(point, pAC);
    var dBC = color.distanceBetweenPoints(point, pBC);

    var lowest = dAB;
    var closestPoint = pAB;

    if (dAC < lowest) {
      lowest = dAC;
      closestPoint = pAC;
    }
    if (dBC < lowest) {
      lowest = dBC;
      closestPoint = pBC;
    }

    // Change the point value to a value which is within the gamut.
    point.x = closestPoint.x;
    point.y = closestPoint.y;
    return point;
  };
  color.bound = function(value) {
    return Math.max(0, Math.min(1, value));
  };
  color.mapXyToGamut = function(point, gamut) {
    var x = point.x;
    var y = point.y;

    // A perpendicular line from point p on br will pass through g.
    var p = color.closestPointOnLine(gamut.b, gamut.r, gamut.g);

    if (x >= 0.5) {
      // Get pr as a vector, and multiply it by scalar distance from x = 0.5.
      var xv = color.xyPoint((gamut.r.x - p.x) * (x - 0.5) / 0.5, (gamut.r.y - p.y) * (x - 0.5) / 0.5);
    } else {
      // Get pb as a vector, and multiple it by scalar distance from x = 0.5.
      var xv = color.xyPoint((gamut.b.x - p.x ) * (0.5 - x) / 0.5, (gamut.b.y - p.y) * (0.5 - x) / 0.5);
    }

    // Now get pg as a vector and multiply it by scalar y.
    var yv = color.xyPoint((gamut.g.x - p.x) * y, (gamut.g.y - p.y) * y);

    // Add x and y vectors and translate them to point p.
    return color.xyPoint(yv.x + xv.x + p.x, yv.y + xv.y + p.y);
  };
  return color;
}]);

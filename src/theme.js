/*global module, require */
var _ = require('underscore'),
	colorParser = require('./color-parser');
module.exports = function Theme(themeJson) {
	'use strict';
	var self = this,
		themeDictionary = _.extend({}, themeJson),
		getElementForPath = function (object, pathArray) {
			var remaining = pathArray.slice(0),
				current = object;

			while (remaining.length > 0) {
				current = current[remaining[0]];
				if (current === undefined) {
					return;
				}
				remaining = remaining.slice(1);
			}
			return current;
		};
	self.getFontForStyles = function (themeStyles) {
		var weight = self.attributeValue(['node'], themeStyles, ['text', 'font', 'weight'], 'semibold'),
			size = self.attributeValue(['node'], themeStyles, ['text', 'font', 'size'], 12),
			lineSpacing = self.attributeValue(['node'], themeStyles, ['text', 'font', 'lineSpacing'], 3.5);
		return {size: size, weight: weight, lineGap: lineSpacing};
	};
	self.getNodeMargin = function (themeStyles) {
		return self.attributeValue(['node'], themeStyles, ['text', 'margin'], 5);
	};
	self.name = themeJson && themeJson.name;
	self.attributeValue = function (prefixes, styles, postfixes, fallback) {
		var rootElement = getElementForPath(themeDictionary, prefixes),
			merged = {},
			result;
		if (!rootElement) {
			return fallback;
		}
		if (styles && styles.length) {
			styles.slice(0).reverse().forEach(function (style) {
				merged = _.extend(merged, rootElement[style]);
			});
		} else {
			merged = _.extend({}, rootElement);
		}
		result = getElementForPath(merged, postfixes);
		if (result === undefined) {
			return fallback;
		}
		return result;
	};
	self.nodeStyles = function (nodeLevel, nodeAttr) {
		var result = ['level_' + nodeLevel, 'default'];
		if (nodeAttr && nodeAttr.group) {
			result.unshift('attr_group');
			if (typeof nodeAttr.group === 'string' || typeof nodeAttr.group === 'number') {
				result.unshift('attr_group_' + nodeAttr.group);
			}
		}
		return result;
	};
	self.nodeTheme = function (styles) {
		var getBackgroundColor = function () {
				var colorObj = getElementForPath(merged, ['background']);
				if (colorObj) {
					return colorParser(colorObj);
				}
				return getElementForPath(merged, ['backgroundColor']);
			},
			rootElement = getElementForPath(themeDictionary, ['node']),
			merged = {},
			result = {
				margin: 5,
				font: {
					size: 12,
					weight: 'semibold',
					linespacing: 3.5
				},
				maxWidth: 146,
				backgroundColor: '#E0E0E0',
				borderType: 'surround',
				cornerRadius: 5,
				lineColor: '#707070',
				text: {
					color: '#4F4F4F',
					lightColor: '#EEEEEE',
					darkColor: '#000000'
				}
			};
		if (!rootElement) {
			return result;
		}
		styles.slice(0).reverse().forEach(function (style) {
			merged = _.extend(merged, rootElement[style]);
		});
		result.margin = getElementForPath(merged, ['text', 'margin']) || result.margin;
		result.font = _.extend(result.font, getElementForPath(merged, ['text', 'font']));
		result.text = _.extend(result.text, getElementForPath(merged, ['text']));
		result.borderType = getElementForPath(merged, ['border', 'type']) || result.borderType;
		result.backgroundColor = getBackgroundColor() || result.backgroundColor;
		result.cornerRadius = getElementForPath(merged, ['cornerRadius']) || result.cornerRadius;
		result.lineColor = getElementForPath(merged, ['border', 'line', 'color']) || result.lineColor;
		return result;
	};

	self.connectorControlPoint = function (childPosition, connectorStyle) {
		var controlPointOffset = childPosition === 'horizontal' ? 1 : 1.75,
			defaultControlPoint = {'width': 0, 'height': controlPointOffset},
			configuredControlPoint = connectorStyle && getElementForPath(themeDictionary, ['connector', connectorStyle, 'controlPoint', childPosition]);

		return (configuredControlPoint && _.extend({}, configuredControlPoint)) || defaultControlPoint;
	};
	self.connectorTheme = function (childPosition, childStyles, parentStyles) {
		var position = childPosition || 'horizontal',
			childConnectorStyle = self.attributeValue(['node'], childStyles, ['connections', 'style'], 'default'),
			parentConnectorStyle = parentStyles && self.attributeValue(['node'], parentStyles, ['connections', 'childstyle'], false),
			childConnector = getElementForPath(themeDictionary, ['connector', childConnectorStyle]),
			parentConnector = parentConnectorStyle && getElementForPath(themeDictionary, ['connector', parentConnectorStyle]),
			combinedStyle = parentConnectorStyle && (parentConnectorStyle + '.' + childConnectorStyle),
			combinedConnector = combinedStyle &&  getElementForPath(themeDictionary, ['connector', combinedStyle]),
			connectorStyle  = (combinedConnector && combinedStyle) || (parentConnector && parentConnectorStyle) || childConnectorStyle || 'default',
			controlPoint = self.connectorControlPoint(position, connectorStyle),
			connectorDefaults = {
				type: 'quadratic',
				line: {
					color: '#707070',
					width: 1.0
				}
			},
			returnedConnector =  combinedConnector || parentConnector || childConnector || connectorDefaults;
		returnedConnector = _.extend({}, returnedConnector);
		returnedConnector.controlPoint = controlPoint;
		returnedConnector.line = returnedConnector.line || connectorDefaults.line;
		return returnedConnector;
	};

	if (themeDictionary && themeDictionary.node && themeDictionary.node.forEach) {
		themeDictionary.nodeArray = themeDictionary.node;
		themeDictionary.node = {};
		themeDictionary.nodeArray.forEach(function (nodeStyle) {
			themeDictionary.node[nodeStyle.name] = nodeStyle;
		});
		delete themeDictionary.nodeArray;
	}
};

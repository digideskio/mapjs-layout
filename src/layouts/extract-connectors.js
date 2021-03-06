/*global module */
module.exports = function extractConnectors(aggregate, visibleNodes) {
	'use strict';
	var result = {},
		traverse = function (idea, parentId, isChildNode) {
			if (isChildNode) {
				if (!visibleNodes[idea.id]) {
					return;
				}
				if (parentId !== aggregate.id) {
					result[idea.id] = {from: parentId, to: idea.id};
				}
			}
			if (idea.ideas) {
				Object.keys(idea.ideas).forEach(function (subNodeRank) {
					traverse(idea.ideas[subNodeRank], idea.id, true);
				});
			}
		};
	traverse(aggregate);
	return result;
};

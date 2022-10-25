window.addEventListener('DOMContentLoaded', () => {
	function SearchTabIds(url) {
		return new Promise((resolve) => {
			chrome.tabs.query({
				url: [url],
			}, (tabs) => {
				const tabIds = [];
				for (const tab of tabs) {
					console.log(`${tab.id} ${tab.url}`);
					tabIds.push(tab.id);
				}
				resolve(tabIds);
			});
		});
	}

	function CountAllTabs() {
		return new Promise((resolve) => {
			chrome.windows.getAll({ populate: true }, (windows) => {
				let count = 0;
				windows.forEach((window) => {
					count += window.tabs.length;
				});
				resolve(count);
			});
		});
	}

	function GetWindowId() {
		return new Promise((resolve) => {
			chrome.windows.getCurrent((window) => {
				resolve(window.id);
			});
		});
	}

	document.getElementById('aggregate').addEventListener('click', () => {
		const url = document.getElementById('url').value;
		if (!url) {
			document.getElementById('count').textContent = '0';
			return;
		}
		Promise.all([
			GetWindowId(),
			CountAllTabs(),
			SearchTabIds(url),
		]).then((result) => {
			const [windowId, total, tabIds] = result;
			console.log(windowId, total, tabIds);
			chrome.tabs.move(
				tabIds,
				{
					windowId: windowId,
					index: -1,
				},
			);
			document.getElementById('count').textContent = `${tabIds.length} / ${total}`;
		});
	});
});

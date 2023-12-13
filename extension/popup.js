window.addEventListener('DOMContentLoaded', () => {
	function SearchTabIds(url) {
		return new Promise((resolve) => {
			chrome.tabs.query({
				url: [url],
			}, (tabs) => {
				const tabIds = [];
				for (const tab of tabs) {
					addLog(tab.url);
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

	const isDryRun = ((checkbox) => {
		return () => {
			return checkbox.checked;
		};
	})(document.getElementById('dry_run'));

	const [addLog, clearLog] = ((checkbox, textarea) => {
		checkbox.addEventListener('change', () => {
			textarea.disabled = !checkbox.checked;
		});
		textarea.addEventListener('focus', () => {
			textarea.select();
		});
		return [
			(url) => {
				if (!checkbox.checked) {
					return;
				}
				textarea.value += `${url}\n`;
			},
			() => {
				textarea.value = '';
			},
		];
	})(document.getElementById('enable_log'), document.getElementById('log'));

	document.getElementById('merge').addEventListener('click', () => {
		const url = document.getElementById('url').value;
		if (!url) {
			document.getElementById('count').textContent = '0';
			return;
		}
		clearLog();
		Promise.all([
			GetWindowId(),
			CountAllTabs(),
			SearchTabIds(url),
		]).then((result) => {
			const [windowId, total, tabIds] = result;
			if (!isDryRun()) {
				chrome.tabs.move(
					tabIds,
					{
						windowId: windowId,
						index: -1,
					},
				);
			}
			document.getElementById('count').textContent = `${tabIds.length} / ${total}`;
		});
	});
});

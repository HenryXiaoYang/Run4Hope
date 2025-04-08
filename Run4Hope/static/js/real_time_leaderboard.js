let autoRefresh = false;
let refreshInterval;

function toggleLeaderboard() {
    autoRefresh = !autoRefresh;
    if (autoRefresh) {
        refreshTable();  // 立即刷新一次
        refreshInterval = setInterval(refreshTable, 5000); // 每5秒刷新一次
    } else {
        clearInterval(refreshInterval);
        // 清除所有排名相关的CSS样式
        const houseBoxes = document.querySelectorAll('.houses-container .house-box');
        houseBoxes.forEach(box => {
            // 移除所有排名标记
            box.classList.remove('rank-1', 'rank-2', 'rank-3', 'rank-4');
            // 移除排名图标
            const nameElement = box.querySelector('strong');
            if (nameElement) {
                nameElement.innerHTML = nameElement.innerHTML.replace(/<span class="rank-icon .*?">.*?<\/span>/g, '').replace(/🥇|🥈|🥉|4️⃣/g, '').trim();
            }
        });

        // 清除游泳者表格中的排名图标
        const runnerRows = document.querySelectorAll('#runnersTable tbody tr');
        runnerRows.forEach(row => {
            const nameCell = row.querySelector('td:first-child');
            if (nameCell) {
                nameCell.innerHTML = nameCell.innerHTML.replace(/<span class="rank-icon .*?">.*?<\/span>/g, '').replace(/🥇|🥈|🥉/g, '').trim();
            }
        });
    }
}

function refreshTable() {
    fetch("?leaderboard=true")
        .then(response => response.text())
        .then(data => {
            const parser = new DOMParser();
            const doc = parser.parseFromString(data, 'text/html');
            
            // 更新游泳者表格
            const newTableBody = doc.querySelector('#runnersTable tbody');
            if (newTableBody) {
                const currentTableBody = document.querySelector('#runnersTable tbody');
                currentTableBody.innerHTML = newTableBody.innerHTML;

                // 更新排名标志
                const rows = currentTableBody.querySelectorAll('tr');
                rows.forEach((row, index) => {
                    const nameCell = row.querySelector('td:first-child');
                    if (nameCell) {
                        // 首先清除任何现有的奖杯图标
                        let cellContent = nameCell.innerHTML.trim();
                        cellContent = cellContent.replace(/<span class="rank-icon .*?">.*?<\/span>/g, '').replace(/🥇|🥈|🥉/g, '').trim();
                        
                        // 添加新的奖杯图标
                        let winnerSign = '';
                        if (index === 0) {
                            winnerSign = '<span class="rank-icon gold">🥇</span>';
                        } else if (index === 1) {
                            winnerSign = '<span class="rank-icon silver">🥈</span>';
                        } else if (index === 2) {
                            winnerSign = '<span class="rank-icon bronze">🥉</span>';
                        }
                        nameCell.innerHTML = winnerSign ? `${winnerSign} ${cellContent}` : cellContent;
                    }
                });
            }
            else {
                console.error('未能在获取的HTML中找到表格主体。');
            }

            // 更新基本统计数据
            updateElements('.stats-grid .count-box div', doc);
            
            // 获取和排序学院数据
            const houses = [
                { name: 'spring', laps: parseInt(doc.querySelector('.house-spring div').textContent) },
                { name: 'summer', laps: parseInt(doc.querySelector('.house-summer div').textContent) },
                { name: 'autumn', laps: parseInt(doc.querySelector('.house-autumn div').textContent) },
                { name: 'winter', laps: parseInt(doc.querySelector('.house-winter div').textContent) }
            ];
            
            // 按圈数排序学院（降序）
            houses.sort((a, b) => b.laps - a.laps);
            
            // 更新学院排名
            const houseBoxes = document.querySelectorAll('.houses-container .house-box');
            houseBoxes.forEach(box => {
                // 移除所有排名标记
                box.classList.remove('rank-1', 'rank-2', 'rank-3', 'rank-4');
                box.querySelector('strong').innerHTML = box.querySelector('strong').innerHTML.replace(/🥇|🥈|🥉|4️⃣/g, '');
            });
            
            // 添加排名标记到学院
            houses.forEach((house, index) => {
                const houseBox = document.querySelector(`.house-${house.name}`);
                if (houseBox) {
                    const rankClass = `rank-${index + 1}`;
                    houseBox.classList.add(rankClass);
                    
                    // 添加排名图标
                    const nameElement = houseBox.querySelector('strong');
                    // 先清除现有的排名图标
                    let houseName = nameElement.innerHTML.replace(/<span class="rank-icon .*?">.*?<\/span>/g, '').replace(/🥇|🥈|🥉|4️⃣/g, '').trim();
                    
                    let rankIcon = '';
                    if (index === 0) rankIcon = '<span class="rank-icon gold">🥇</span>';
                    else if (index === 1) rankIcon = '<span class="rank-icon silver">🥈</span>';
                    else if (index === 2) rankIcon = '<span class="rank-icon bronze">🥉</span>';
                    else rankIcon = '<span class="rank-icon fourth">4️⃣</span>';
                    
                    nameElement.innerHTML = `${rankIcon} ${houseName}`;
                    
                    // 更新圈数显示
                    const lapsElement = houseBox.querySelector('div');
                    if (lapsElement) {
                        lapsElement.textContent = house.laps;
                    }
                }
            });
        })
        .catch(error => console.error('获取数据时出错:', error));
}

// 辅助函数：根据选择器更新元素内容
function updateElements(selector, docSource) {
    const targetElements = document.querySelectorAll(selector);
    const sourceElements = docSource.querySelectorAll(selector);
    
    if (targetElements.length === sourceElements.length) {
        for (let i = 0; i < targetElements.length; i++) {
            targetElements[i].innerHTML = sourceElements[i].innerHTML;
        }
    } else {
        console.error(`元素数量不匹配: ${selector}`);
    }
}

// 重新绑定圈数按钮的事件处理函数
function rebindLapButtonEvents() {
    // 此函数现已废弃，事件绑定在index.html中处理
    console.warn('rebindLapButtonEvents is deprecated. Events are now handled in index.html');
    return false;
}

// 初始化时绑定事件
document.addEventListener('DOMContentLoaded', function() {
    // 检查是否在index.html页面上
    if (document.querySelector('#leaderboard-switch')) {
        // 绑定排行榜切换事件
        const leaderboardSwitch = document.querySelector('#leaderboard-switch');
        if (leaderboardSwitch.checked) {
            autoRefresh = true;
            refreshInterval = setInterval(refreshTable, 5000);
        }
        
        // 不再绑定按钮事件，交给index.html处理
        // rebindLapButtonEvents();
    }
});
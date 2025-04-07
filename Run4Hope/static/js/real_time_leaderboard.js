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
            
            // 重新绑定圈数按钮事件
            rebindLapButtonEvents();
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
    // 获取所有加减圈按钮
    const lapButtons = document.querySelectorAll('.lap-button');
    
    // 为每个按钮添加点击事件
    lapButtons.forEach(button => {
        // 清除现有事件以避免重复绑定
        button.removeEventListener('click', handleLapButtonClick);
        // 添加新事件
        button.addEventListener('click', handleLapButtonClick);
    });
}

// 按钮点击处理函数
function handleLapButtonClick() {
    // 如果按钮被禁用，不执行操作
    if (this.hasAttribute('disabled')) return;
    
    // 获取表单和相关数据
    const form = this.closest('form');
    const runnerId = form.dataset.runnerId;
    const action = form.dataset.action;
    const url = form.action;
    const csrfToken = form.querySelector('input[name="csrfmiddlewaretoken"]').value;
    
    // 获取当前圈数显示元素
    const lapCountElement = document.getElementById(`lap-count-${runnerId}`);
    const currentLaps = parseInt(lapCountElement.textContent);
    
    // 防止负值
    if (action === 'decrement' && currentLaps <= 0) return;
    
    // 乐观更新UI（不等待服务器响应）
    if (action === 'increment') {
        lapCountElement.textContent = currentLaps + 1;
    } else if (action === 'decrement' && currentLaps > 0) {
        lapCountElement.textContent = currentLaps - 1;
        
        // 如果圈数为1且要减1，则禁用减号按钮
        if (currentLaps === 1) {
            this.disabled = true;
        }
    }
    
    // 发送AJAX请求
    fetch(url, {
        method: 'POST',
        headers: {
            'X-Requested-With': 'XMLHttpRequest',
            'X-CSRFToken': csrfToken,
            'Content-Type': 'application/x-www-form-urlencoded'
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            // 更新为服务器返回的实际值
            lapCountElement.textContent = data.lap_count;
            
            // 根据返回的圈数更新按钮状态
            if (action === 'decrement') {
                const minusButton = form.querySelector('.minus-button');
                if (data.lap_count <= 0) {
                    minusButton.disabled = true;
                } else {
                    minusButton.disabled = false;
                }
            }
            
            // 更新学院圈数
            const house = data.house.toLowerCase();
            document.querySelector(`.house-${house} div`).textContent = data[`${house}_laps`];
            
            // 更新总圈数和筹集金额
            document.querySelector('.count-box:nth-child(3) div').textContent = data.total_laps;
            document.querySelector('.count-box:nth-child(4) div').textContent = data.amount_raised + '¥';
        }
    })
    .catch(error => {
        console.error('Error:', error);
        // 发生错误时恢复原来的值
        lapCountElement.textContent = currentLaps;
    });
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
        
        // 初始绑定按钮事件
        rebindLapButtonEvents();
    }
});
// Solar System Escape - Game Engine
class SolarSystemEscape {
    constructor() {
        this.gameData = {
            // リソース
            resources: {
                minerals: 0,
                energy: 0,
                science: 0,
                rareMetals: 0
            },
            
            // 現在の惑星
            currentPlanet: 'mercury',
            
            // 惑星情報
            planets: {
                mercury: { 
                    name: '水星', 
                    unlocked: true, 
                    exploration: 0, 
                    level: 1, 
                    specialResource: '耐熱金属',
                    emoji: '☿️',
                    baseReward: { minerals: 1, energy: 0, science: 0 }
                },
                venus: { 
                    name: '金星', 
                    unlocked: false, 
                    exploration: 0, 
                    level: 0, 
                    specialResource: '高圧結晶',
                    emoji: '♀️',
                    baseReward: { minerals: 2, energy: 1, science: 0 }
                },
                earth: { 
                    name: '地球', 
                    unlocked: false, 
                    exploration: 0, 
                    level: 0, 
                    specialResource: '生体物質',
                    emoji: '🌍',
                    baseReward: { minerals: 1, energy: 2, science: 1 }
                },
                mars: { 
                    name: '火星', 
                    unlocked: false, 
                    exploration: 0, 
                    level: 0, 
                    specialResource: '酸化鉄',
                    emoji: '♂️',
                    baseReward: { minerals: 3, energy: 1, science: 1 }
                },
                jupiter: { 
                    name: '木星', 
                    unlocked: false, 
                    exploration: 0, 
                    level: 0, 
                    specialResource: 'ヘリウム3',
                    emoji: '♃',
                    baseReward: { minerals: 1, energy: 5, science: 2 }
                },
                saturn: { 
                    name: '土星', 
                    unlocked: false, 
                    exploration: 0, 
                    level: 0, 
                    specialResource: 'リング鉱物',
                    emoji: '♄',
                    baseReward: { minerals: 4, energy: 2, science: 2, rareMetals: 1 }
                },
                uranus: { 
                    name: '天王星', 
                    unlocked: false, 
                    exploration: 0, 
                    level: 0, 
                    specialResource: '氷化合物',
                    emoji: '♅',
                    baseReward: { minerals: 2, energy: 3, science: 4, rareMetals: 1 }
                },
                neptune: { 
                    name: '海王星', 
                    unlocked: false, 
                    exploration: 0, 
                    level: 0, 
                    specialResource: '深宇宙物質',
                    emoji: '♆',
                    baseReward: { minerals: 3, energy: 4, science: 5, rareMetals: 2 }
                }
            },
            
            // アップグレード
            upgrades: {
                mining: { level: 1, baseCost: { minerals: 10 } },
                autoMining: { level: 0, baseCost: { energy: 50 } },
                propulsion: { level: 1, baseCost: { energy: 100 } }
            },
            
            // 技術研究
            research: {
                efficientMining: { unlocked: true, completed: false, progress: 0, cost: { science: 100 } },
                energyManagement: { unlocked: false, completed: false, progress: 0, cost: { science: 200 } },
                spaceshipEngineering: { unlocked: false, completed: false, progress: 0, cost: { science: 300 } }
            },
            
            // 統計
            stats: {
                totalClicks: 0,
                totalMineralsMined: 0,
                startTime: Date.now(),
                totalPlaytime: 0
            }
        };
        
        this.autoMiningRate = 0;
        this.clickPower = 1;
        
        this.init();
    }
    
    init() {
        this.loadGame();
        this.bindEvents();
        this.startGameLoop();
        this.updateUI();
    }
    
    bindEvents() {
        // クリックエリア
        document.getElementById('click-area').addEventListener('click', (e) => {
            this.handlePlanetClick(e);
        });
        
        // タブ切り替え
        document.querySelectorAll('.tab-button').forEach(button => {
            button.addEventListener('click', () => {
                this.switchTab(button.dataset.tab);
            });
        });
        
        // アップグレードボタン
        document.getElementById('upgrade-mining').addEventListener('click', () => {
            this.upgradeItem('mining');
        });
        
        document.getElementById('upgrade-auto-mining').addEventListener('click', () => {
            this.upgradeItem('autoMining');
        });
        
        document.getElementById('upgrade-propulsion').addEventListener('click', () => {
            this.upgradeItem('propulsion');
        });
        
        // 惑星選択
        document.querySelectorAll('.planet-item').forEach(item => {
            item.addEventListener('click', () => {
                const planet = item.dataset.planet;
                if (this.gameData.planets[planet].unlocked) {
                    this.switchPlanet(planet);
                }
            });
        });
        
        // セーブ・ロード
        document.getElementById('save-game').addEventListener('click', () => {
            this.saveGame();
        });
        
        document.getElementById('load-game').addEventListener('click', () => {
            this.loadGame();
        });
        
        document.getElementById('export-save').addEventListener('click', () => {
            this.exportSave();
        });
    }
    
    handlePlanetClick(event) {
        const planet = this.gameData.planets[this.gameData.currentPlanet];
        const rewards = this.calculateRewards(planet);
        
        // リソース獲得
        Object.keys(rewards).forEach(resource => {
            this.gameData.resources[resource] += rewards[resource];
        });
        
        // 探索進行度アップ
        const explorationGain = this.clickPower;
        planet.exploration += explorationGain;
        
        // レベルアップチェック
        const requiredExp = this.getRequiredExploration(planet.level);
        if (planet.exploration >= requiredExp) {
            planet.level++;
            planet.exploration = 0;
            this.showNotification(`${planet.name}の探索レベルが${planet.level}になりました！`, 'success');
            
            // 新しい惑星解放チェック
            this.checkPlanetUnlock();
        }
        
        // 統計更新
        this.gameData.stats.totalClicks++;
        this.gameData.stats.totalMineralsMined += rewards.minerals || 0;
        
        // UI更新
        this.updateUI();
        
        // クリックエフェクト
        this.showClickEffect(event);
    }
    
    calculateRewards(planet) {
        const baseReward = planet.baseReward;
        const multiplier = this.gameData.upgrades.mining.level;
        const rewards = {};
        
        Object.keys(baseReward).forEach(resource => {
            rewards[resource] = Math.floor(baseReward[resource] * multiplier * this.clickPower);
        });
        
        return rewards;
    }
    
    getRequiredExploration(level) {
        return Math.floor(100 * Math.pow(1.5, level - 1));
    }
    
    checkPlanetUnlock() {
        const currentLevel = this.gameData.planets[this.gameData.currentPlanet].level;
        const planetOrder = ['mercury', 'venus', 'earth', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune'];
        const currentIndex = planetOrder.indexOf(this.gameData.currentPlanet);
        
        if (currentLevel >= 3 && currentIndex < planetOrder.length - 1) {
            const nextPlanet = planetOrder[currentIndex + 1];
            if (!this.gameData.planets[nextPlanet].unlocked) {
                this.gameData.planets[nextPlanet].unlocked = true;
                this.gameData.planets[nextPlanet].level = 1;
                this.showNotification(`新しい惑星「${this.gameData.planets[nextPlanet].name}」が解放されました！`, 'success');
            }
        }
    }
    
    upgradeItem(upgradeType) {
        const upgrade = this.gameData.upgrades[upgradeType];
        const cost = this.calculateUpgradeCost(upgradeType);
        
        if (this.canAfford(cost)) {
            // コスト支払い
            Object.keys(cost).forEach(resource => {
                this.gameData.resources[resource] -= cost[resource];
            });
            
            // アップグレード実行
            upgrade.level++;
            
            // 効果適用
            this.applyUpgradeEffects(upgradeType);
            
            this.showNotification(`${this.getUpgradeName(upgradeType)}をレベル${upgrade.level}にアップグレードしました！`, 'success');
            this.updateUI();
        } else {
            this.showNotification('リソースが不足しています', 'error');
        }
    }
    
    calculateUpgradeCost(upgradeType) {
        const upgrade = this.gameData.upgrades[upgradeType];
        const baseCost = upgrade.baseCost;
        const cost = {};
        
        Object.keys(baseCost).forEach(resource => {
            cost[resource] = Math.floor(baseCost[resource] * Math.pow(1.5, upgrade.level));
        });
        
        return cost;
    }
    
    canAfford(cost) {
        return Object.keys(cost).every(resource => {
            return this.gameData.resources[resource] >= cost[resource];
        });
    }
    
    applyUpgradeEffects(upgradeType) {
        switch (upgradeType) {
            case 'mining':
                this.clickPower = this.gameData.upgrades.mining.level;
                break;
            case 'autoMining':
                this.autoMiningRate = this.gameData.upgrades.autoMining.level * 0.5;
                break;
            case 'propulsion':
                // 移動時間短縮（将来実装）
                break;
        }
    }
    
    getUpgradeName(upgradeType) {
        const names = {
            mining: '基本採掘機',
            autoMining: '自動採掘',
            propulsion: '推進システム'
        };
        return names[upgradeType];
    }
    
    switchPlanet(planetKey) {
        if (this.gameData.planets[planetKey].unlocked) {
            this.gameData.currentPlanet = planetKey;
            this.updateUI();
            this.showNotification(`${this.gameData.planets[planetKey].name}に移動しました`, 'success');
        }
    }
    
    switchTab(tabName) {
        // アクティブタブ切り替え
        document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
        
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
        document.getElementById(`${tabName}-tab`).classList.add('active');
    }
    
    updateUI() {
        // リソース表示更新
        Object.keys(this.gameData.resources).forEach(resource => {
            const element = document.getElementById(resource.replace(/([A-Z])/g, '-$1').toLowerCase());
            if (element) {
                element.textContent = this.formatNumber(this.gameData.resources[resource]);
            }
        });
        
        // 現在の惑星情報更新
        const currentPlanet = this.gameData.planets[this.gameData.currentPlanet];
        document.getElementById('planet-name').textContent = currentPlanet.name;
        document.getElementById('special-resource').textContent = currentPlanet.specialResource;
        document.getElementById('exploration-level').textContent = currentPlanet.level;
        
        // 探索進行度更新
        const requiredExp = this.getRequiredExploration(currentPlanet.level);
        const progressPercent = (currentPlanet.exploration / requiredExp) * 100;
        document.getElementById('exploration-progress').style.width = `${progressPercent}%`;
        document.getElementById('progress-text').textContent = `探索進行度: ${Math.floor(progressPercent)}%`;
        
        // 惑星表示更新
        const planetImage = document.getElementById('planet-image');
        planetImage.className = `planet ${this.gameData.currentPlanet}`;
        
        // アップグレード情報更新
        this.updateUpgradeUI();
        
        // 惑星リスト更新
        this.updatePlanetList();
        
        // 統計更新
        this.updateStatsUI();
        
        // 自動採掘表示更新
        document.getElementById('auto-mining-rate').textContent = this.autoMiningRate.toFixed(1);
    }
    
    updateUpgradeUI() {
        // 採掘装備レベル
        document.getElementById('mining-level').textContent = this.gameData.upgrades.mining.level;
        document.getElementById('auto-mining-level').textContent = this.gameData.upgrades.autoMining.level;
        document.getElementById('propulsion-level').textContent = this.gameData.upgrades.propulsion.level;
        
        // アップグレードボタンの状態
        const upgrades = ['mining', 'auto-mining', 'propulsion'];
        upgrades.forEach(upgradeId => {
            const upgradeType = upgradeId.replace('-', '').replace('autoMining', 'autoMining');
            const actualUpgradeType = upgradeId === 'auto-mining' ? 'autoMining' : upgradeType;
            const cost = this.calculateUpgradeCost(actualUpgradeType);
            const button = document.getElementById(`upgrade-${upgradeId}`);
            const canAfford = this.canAfford(cost);
            
            button.disabled = !canAfford;
            
            // コスト表示更新
            const costElement = button.parentElement.querySelector('.upgrade-cost');
            const costText = Object.keys(cost).map(resource => {
                const resourceName = this.getResourceName(resource);
                return `${cost[resource]} ${resourceName}`;
            }).join(', ');
            costElement.innerHTML = costText;
        });
    }
    
    updatePlanetList() {
        document.querySelectorAll('.planet-item').forEach(item => {
            const planetKey = item.dataset.planet;
            const planet = this.gameData.planets[planetKey];
            
            // ロック状態更新
            if (planet.unlocked) {
                item.classList.remove('locked');
                item.classList.add('unlocked');
            } else {
                item.classList.add('locked');
                item.classList.remove('unlocked');
            }
            
            // アクティブ状態更新
            if (planetKey === this.gameData.currentPlanet) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
            
            // 状態テキスト更新
            const statusElement = item.querySelector('.planet-status');
            if (!planet.unlocked) {
                statusElement.textContent = '未解放';
            } else if (planetKey === this.gameData.currentPlanet) {
                statusElement.textContent = '探索中';
            } else {
                statusElement.textContent = `Lv.${planet.level}`;
            }
        });
    }
    
    updateStatsUI() {
        const currentTime = Date.now();
        const sessionTime = Math.floor((currentTime - this.gameData.stats.startTime) / 60000);
        const totalTime = this.gameData.stats.totalPlaytime + sessionTime;
        
        document.getElementById('total-playtime').textContent = `${totalTime}分`;
        document.getElementById('total-clicks').textContent = this.formatNumber(this.gameData.stats.totalClicks);
        document.getElementById('total-minerals-mined').textContent = this.formatNumber(this.gameData.stats.totalMineralsMined);
    }
    
    getResourceName(resourceKey) {
        const names = {
            minerals: '鉱物',
            energy: 'エネルギー',
            science: '科学データ',
            rareMetals: 'レアメタル'
        };
        return names[resourceKey];
    }
    
    formatNumber(num) {
        if (num >= 1000000) {
            return (num / 1000000).toFixed(1) + 'M';
        } else if (num >= 1000) {
            return (num / 1000).toFixed(1) + 'K';
        } else {
            return num.toString();
        }
    }
    
    showClickEffect(event) {
        const rect = event.target.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        
        const effect = document.createElement('div');
        effect.className = 'click-effect';
        effect.style.left = `${x - 50}px`;
        effect.style.top = `${y - 50}px`;
        
        event.target.appendChild(effect);
        
        setTimeout(() => {
            effect.remove();
        }, 600);
    }
    
    showNotification(message, type = 'info') {
        const container = document.getElementById('notification-container');
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        
        container.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }
    
    startGameLoop() {
        setInterval(() => {
            // 自動採掘
            if (this.autoMiningRate > 0) {
                const currentPlanet = this.gameData.planets[this.gameData.currentPlanet];
                const rewards = this.calculateAutoRewards(currentPlanet);
                
                Object.keys(rewards).forEach(resource => {
                    this.gameData.resources[resource] += rewards[resource];
                });
                
                this.updateUI();
            }
            
            // 定期セーブ
            this.saveGame();
        }, 1000);
    }
    
    calculateAutoRewards(planet) {
        const baseReward = planet.baseReward;
        const rewards = {};
        
        Object.keys(baseReward).forEach(resource => {
            const baseAmount = baseReward[resource] || 0;
            rewards[resource] = Math.max(0, Math.floor(baseAmount * this.autoMiningRate));
        });
        
        return rewards;
    }
    
    saveGame() {
        try {
            const saveData = {
                ...this.gameData,
                stats: {
                    ...this.gameData.stats,
                    totalPlaytime: this.gameData.stats.totalPlaytime + Math.floor((Date.now() - this.gameData.stats.startTime) / 60000)
                }
            };
            localStorage.setItem('solarSystemEscape', JSON.stringify(saveData));
        } catch (error) {
            console.error('セーブに失敗しました:', error);
        }
    }
    
    loadGame() {
        try {
            const savedData = localStorage.getItem('solarSystemEscape');
            if (savedData) {
                const data = JSON.parse(savedData);
                this.gameData = { ...this.gameData, ...data };
                this.gameData.stats.startTime = Date.now();
                
                // アップグレード効果を再適用
                this.applyUpgradeEffects('mining');
                this.applyUpgradeEffects('autoMining');
                this.applyUpgradeEffects('propulsion');
                
                this.updateUI();
                this.showNotification('ゲームをロードしました', 'success');
            }
        } catch (error) {
            console.error('ロードに失敗しました:', error);
            this.showNotification('ロードに失敗しました', 'error');
        }
    }
    
    exportSave() {
        try {
            const saveData = JSON.stringify(this.gameData, null, 2);
            const blob = new Blob([saveData], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            
            const a = document.createElement('a');
            a.href = url;
            a.download = 'solar_system_escape_save.json';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            this.showNotification('セーブデータをエクスポートしました', 'success');
        } catch (error) {
            console.error('エクスポートに失敗しました:', error);
            this.showNotification('エクスポートに失敗しました', 'error');
        }
    }
}

// ゲーム開始
document.addEventListener('DOMContentLoaded', () => {
    window.game = new SolarSystemEscape();
});
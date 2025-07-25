const { dbConnection } = require("../config/db");
const pool = dbConnection();

/**
 * 檢查過期處罰並更新用戶禁用狀態
 * 此腳本可以設置為定時任務每隔一段時間運行
 */
async function checkExpiredPunishments() {
    console.log("開始檢查過期處罰...");

    try {
        // 查找所有已過期但仍然處於活動狀態的處罰
        const expiredPunishments = await new Promise((resolve, reject) => {
            const query = `
        SELECT p.punishmentId, p.userId 
        FROM punishments p
        WHERE p.isActive = 1 
        AND p.isPermanent = 0
        AND p.endDate <= NOW()
      `;

            pool.query(query, (err, results) => {
                if (err) {
                    console.error("查詢過期處罰錯誤:", err);
                    return reject(err);
                }
                resolve(results);
            });
        });

        console.log(`找到 ${expiredPunishments.length} 個過期處罰`);

        // 更新每個過期處罰的狀態
        for (const punishment of expiredPunishments) {
            await new Promise((resolve, reject) => {
                const query = `
          UPDATE punishments
          SET isActive = 0
          WHERE punishmentId = ?
        `;

                pool.query(query, [punishment.punishmentId], (err, results) => {
                    if (err) {
                        console.error(`更新處罰 ${punishment.punishmentId} 狀態錯誤:`, err);
                        return reject(err);
                    }
                    console.log(`處罰 ${punishment.punishmentId} 已標記為非活動`);
                    resolve(results);
                });
            });

            // 檢查用戶是否還有其他活動的處罰
            const activeCount = await new Promise((resolve, reject) => {
                const query = `
          SELECT COUNT(*) AS count
          FROM punishments
          WHERE userId = ? AND isActive = 1
        `;

                pool.query(query, [punishment.userId], (err, results) => {
                    if (err) {
                        console.error(`檢查用戶 ${punishment.userId} 活動處罰錯誤:`, err);
                        return reject(err);
                    }
                    resolve(results[0].count);
                });
            });

            // 如果沒有其他活動處罰，取消用戶禁用
            if (activeCount === 0) {
                await new Promise((resolve, reject) => {
                    const query = `
            UPDATE users
            SET disable = 0
            WHERE userId = ?
          `;

                    pool.query(query, [punishment.userId], (err, results) => {
                        if (err) {
                            console.error(`更新用戶 ${punishment.userId} 禁用狀態錯誤:`, err);
                            return reject(err);
                        }
                        console.log(`用戶 ${punishment.userId} 已解除禁用`);
                        resolve(results);
                    });
                });
            }
        }

        console.log("過期處罰檢查完成");

    } catch (error) {
        console.error("檢查過期處罰時出錯:", error);
    }
}

// 如果直接運行此文件則執行檢查
if (require.main === module) {
    checkExpiredPunishments().then(() => {
        console.log("腳本執行完畢");
        process.exit(0);
    }).catch(err => {
        console.error("腳本執行錯誤:", err);
        process.exit(1);
    });
}

module.exports = { checkExpiredPunishments };
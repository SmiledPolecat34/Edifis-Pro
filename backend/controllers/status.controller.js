const { Setting } = require('../models');

// Helper function to get the maintenance status
const getMaintenanceStatus = async () => {
    const setting = await Setting.findOne({ where: { key: 'maintenance_mode' } });
    // If setting doesn't exist, default to not being in maintenance
    return setting ? setting.value === 'true' : false;
};

// Get the current status
exports.getStatus = async (req, res) => {
    try {
        const isMaintenance = await getMaintenanceStatus();
        res.status(200).json({ maintenance_mode: isMaintenance });
    } catch (error) {
        res.status(500).json({ message: "Erreur du serveur", error: error.message });
    }
};

// Toggle the maintenance status
exports.toggleStatus = async (req, res) => {
    try {
        const currentStatus = await getMaintenanceStatus();
        const newStatus = !currentStatus;

        // Update or create the setting
        await Setting.upsert({ key: 'maintenance_mode', value: newStatus.toString() });

        res.status(200).json({ 
            message: `Mode maintenance ${newStatus ? 'activé' : 'désactivé'}`,
            maintenance_mode: newStatus 
        });
    } catch (error) {
        res.status(500).json({ message: "Erreur du serveur", error: error.message });
    }
};

import './StatusIndicator.css';

function StatusIndicator({ recording, syncStatus, online }) {
  return (
    <div className="status-indicator">
      <div className="status-grid">
        <div className={`status-card recording-status ${recording ? 'active' : ''}`}>
          <div className="status-icon">
            {recording ? '🔴' : '⏸️'}
          </div>
          <div className="status-label">
            {recording ? 'Recording...' : 'Listening'}
          </div>
        </div>

        <div className={`status-card sync-status ${syncStatus.syncing ? 'active' : ''}`}>
          <div className="status-icon">
            {syncStatus.syncing ? '☁️' : syncStatus.pending > 0 ? '📦' : '✓'}
          </div>
          <div className="status-label">
            {syncStatus.syncing && 'Syncing...'}
            {!syncStatus.syncing && syncStatus.pending > 0 && `${syncStatus.pending} pending`}
            {!syncStatus.syncing && syncStatus.pending === 0 && 'All synced'}
          </div>
        </div>

        <div className={`status-card network-status ${online ? 'online' : 'offline'}`}>
          <div className="status-icon">
            {online ? '🌐' : '📡'}
          </div>
          <div className="status-label">
            {online ? 'Online' : 'Offline'}
          </div>
        </div>
      </div>
    </div>
  );
}

export default StatusIndicator;

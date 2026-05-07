import FRIENDS from '../data/friends.json'
import ME from '../data/me.json'
import { truncateName } from '../lib/utils'

const MOCK_USERS = FRIENDS

const RANK_MEDALS = ['🥇', '🥈', '🥉']

export default function LeaderboardTab({ stats, profile }) {
  const me = {
    name: profile?.name ?? ME.name,
    emoji: ME.emoji,
    vapes: stats.totalVapes + ME.totalVapes,
    peakBac: ME.peakBac,
    xp: stats.xp + ME.xp,
    isMe: true,
  }

  const all = [...MOCK_USERS, me].sort((a, b) => b.xp - a.xp)
  const myRank = all.findIndex(u => u.isMe) + 1

  return (
    <div className="tab-screen">
      <div className="page-header">
        <div className="page-header-title">Leaderboard</div>
      </div>

      <div className="tab-body">
        {/* Your rank banner */}
        <div className="rank-banner">
          <div className="rank-banner-left">
            <div className="rank-banner-rank">#{myRank}</div>
            <div className="rank-banner-label">Your Friend Rank</div>
          </div>
          <div className="rank-banner-xp">
            <div className="rank-banner-xp-val">{me.xp.toLocaleString()}</div>
            <div className="rank-banner-xp-label">XP</div>
          </div>
        </div>

        {/* Table */}
        <div className="leaderboard-card">
          <div className="lb-header-row">
            <span className="lb-col-rank">#</span>
            <span className="lb-col-user">User</span>
            <span className="lb-col-stat">💨</span>
            <span className="lb-col-stat">🩸</span>
            <span className="lb-col-xp">XP</span>
          </div>

          {all.map((user, i) => (
            <div
              key={user.name}
              className={`lb-row${user.isMe ? ' lb-row--me' : ''}`}
            >
              <span className="lb-col-rank">
                {i < 3 ? RANK_MEDALS[i] : <span className="lb-rank-num">{i + 1}</span>}
              </span>
              <span className="lb-col-user">
                <span className="lb-user-emoji">{user.emoji}</span>
                <span className="lb-user-name">{truncateName(user.name)}{user.isMe ? ' (you)' : ''}</span>
              </span>
              <span className="lb-col-stat">{user.vapes.toLocaleString()}</span>
              <span className="lb-col-stat">{user.peakBac != null ? user.peakBac.toFixed(2) : '—'}</span>
              <span className="lb-col-xp">{user.xp.toLocaleString()}</span>
            </div>
          ))}
        </div>

        <p className="lb-disclaimer">
          Rankings update in real time. These are your friends and they are definitely real.
        </p>
      </div>
    </div>
  )
}

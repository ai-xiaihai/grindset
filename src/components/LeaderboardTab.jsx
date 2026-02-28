const MOCK_USERS = [
  { name: 'Dmitri',   emoji: '☁️',  vapes: 1203, drinks: 89,  xp: 14250 },
  { name: 'Priya',    emoji: '🍺',  vapes: 234,  drinks: 847, xp: 13920 },
  { name: 'Marcus',   emoji: '⚔️',  vapes: 567,  drinks: 523, xp: 13590 },
  { name: 'Yuki',     emoji: '🌅',  vapes: 890,  drinks: 312, xp: 11540 },
  { name: 'Fatima',   emoji: '🔥',  vapes: 445,  drinks: 445, xp: 10675 },
  { name: 'Carlos',   emoji: '🦋',  vapes: 123,  drinks: 623, xp: 10575 },
  { name: 'Siobhan',  emoji: '🦉',  vapes: 356,  drinks: 567, xp: 9885  },
  { name: 'Kwame',    emoji: '💻',  vapes: 789,  drinks: 234, xp: 8910  },
  { name: 'Ingrid',   emoji: '🕔',  vapes: 67,   drinks: 756, xp: 8545  },
  { name: 'Tariq',    emoji: '🤫',  vapes: 234,  drinks: 345, xp: 5535  },
  { name: 'Mei',      emoji: '📅',  vapes: 45,   drinks: 189, xp: 3225  },
  { name: 'Bogdan',   emoji: '👶',  vapes: 12,   drinks: 23,  xp: 585   },
]

const RANK_MEDALS = ['🥇', '🥈', '🥉']

export default function LeaderboardTab({ stats }) {
  const me = {
    name: 'You',
    emoji: '👤',
    vapes: stats.totalVapes,
    drinks: stats.totalDrinks,
    xp: stats.xp,
    isMe: true,
  }

  const all = [...MOCK_USERS, me].sort((a, b) => b.xp - a.xp)
  const myRank = all.findIndex(u => u.isMe) + 1

  return (
    <div className="tab-screen">
      <div className="page-header">
        <div className="page-header-title">Leaderboard</div>
        <div className="page-header-sub">Global Rankings</div>
      </div>

      <div className="tab-body">
        {/* Your rank banner */}
        <div className="rank-banner">
          <div className="rank-banner-left">
            <div className="rank-banner-rank">#{myRank}</div>
            <div className="rank-banner-label">Your Global Rank</div>
          </div>
          <div className="rank-banner-xp">
            <div className="rank-banner-xp-val">{stats.xp.toLocaleString()}</div>
            <div className="rank-banner-xp-label">XP</div>
          </div>
        </div>

        {/* Table */}
        <div className="leaderboard-card">
          <div className="lb-header-row">
            <span className="lb-col-rank">#</span>
            <span className="lb-col-user">User</span>
            <span className="lb-col-stat">💨</span>
            <span className="lb-col-stat">🥃</span>
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
                <span className="lb-user-name">{user.isMe ? 'You' : user.name}</span>
              </span>
              <span className="lb-col-stat">{user.vapes.toLocaleString()}</span>
              <span className="lb-col-stat">{user.drinks.toLocaleString()}</span>
              <span className="lb-col-xp">{user.xp.toLocaleString()}</span>
            </div>
          ))}
        </div>

        <p className="lb-disclaimer">
          Rankings update in real time. Other users are very real and definitely not made up.
        </p>
      </div>
    </div>
  )
}

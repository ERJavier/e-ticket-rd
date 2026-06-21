import Foundation

struct HomeScreenResponse: Codable {
    let success: Bool
    let liveGames: [HomeGameCard]
    let recentResults: [HomeGameCard]
    let upcomingGames: [HomeGameCard]
    let trendingPlayers: [TrendingPlayer]
    let leagueLeaders: [LeagueLeader]

    enum CodingKeys: String, CodingKey {
        case success
        case liveGames = "live_games"
        case recentResults = "recent_results"
        case upcomingGames = "upcoming_games"
        case trendingPlayers = "trending_players"
        case leagueLeaders = "league_leaders"
    }
}

struct HomeGameCard: Identifiable, Codable {
    let id: Int
    let homeTeam: HomeTeamInfo
    let awayTeam: HomeTeamInfo
    let homeScore: Int
    let awayScore: Int
    let status: String
    let dateTime: String?
    let inning: String?
    let outs: Int?
    let venue: String?
    let homeHits: Int?
    let awayHits: Int?
    let homeErrors: Int?
    let awayErrors: Int?

    enum CodingKeys: String, CodingKey {
        case id, status, inning, outs, venue
        case homeTeam = "home_team"
        case awayTeam = "away_team"
        case homeScore = "home_score"
        case awayScore = "away_score"
        case dateTime = "date_time"
        case homeHits = "home_hits"
        case awayHits = "away_hits"
        case homeErrors = "home_errors"
        case awayErrors = "away_errors"
    }

    var displayDate: String {
        guard let dt = dateTime else { return "" }
        let formatter = ISO8601DateFormatter()
        if let date = formatter.date(from: dt) {
            let df = DateFormatter()
            if Calendar.current.isDateInToday(date) {
                df.dateFormat = "h:mm a"
                return "Hoy \(df.string(from: date))"
            }
            df.dateFormat = "MMM d, h:mm a"
            return df.string(from: date)
        }
        return String(dt.prefix(10))
    }

    var isLive: Bool { status.lowercased() == "live" }
    var isFinished: Bool { status.lowercased() == "finished" }
    var isScheduled: Bool { status.lowercased() == "scheduled" }

    var winnerName: String? {
        guard isFinished else { return nil }
        if homeScore > awayScore { return homeTeam.name }
        if awayScore > homeScore { return awayTeam.name }
        return nil
    }
}

struct HomeTeamInfo: Codable {
    let id: Int
    let name: String
    let shortName: String?
    let logoUrl: String?

    enum CodingKeys: String, CodingKey {
        case id, name
        case shortName = "short_name"
        case logoUrl = "logo_url"
    }
}

struct TrendingPlayer: Identifiable, Codable {
    let id: Int
    let name: String
    let position: String?
    let teamName: String?
    let teamLogoUrl: String?
    let photoUrl: String?
    let keyStat: String
    let statValue: String
    let recentGames: [RecentGameStat]?

    enum CodingKeys: String, CodingKey {
        case id, name, position
        case teamName = "team_name"
        case teamLogoUrl = "team_logo_url"
        case photoUrl = "photo_url"
        case keyStat = "key_stat"
        case statValue = "stat_value"
        case recentGames = "recent_games"
    }
}

struct RecentGameStat: Codable {
    let date: String?
    let statLine: String

    enum CodingKeys: String, CodingKey {
        case date
        case statLine = "stat_line"
    }
}

struct LeagueLeader: Identifiable, Codable {
    let id: String
    let category: LeaderCategory
    let playerId: Int
    let playerName: String
    let teamName: String?
    let statValue: String
    let rank: Int

    enum CodingKeys: String, CodingKey {
        case id, category, rank
        case playerId = "player_id"
        case playerName = "player_name"
        case teamName = "team_name"
        case statValue = "stat_value"
    }
}

enum LeaderCategory: String, Codable, CaseIterable {
    case avg = "AVG"
    case hr = "HR"
    case rbi = "RBI"
    case era = "ERA"
    case so = "SO"
    case sb = "SB"

    var displayName: String {
        switch self {
        case .avg: return "Bateo"
        case .hr: return "Jonrones"
        case .rbi: return "Remolcadas"
        case .era: return "Efectividad"
        case .so: return "Ponches"
        case .sb: return "Robos"
        }
    }

    var systemImage: String {
        switch self {
        case .avg: return "chart.bar.fill"
        case .hr: return "flame.fill"
        case .rbi: return "figure.baseball"
        case .era: return "eye.fill"
        case .so: return "wind"
        case .sb: return "figure.run"
        }
    }

    var tintColor: String {
        switch self {
        case .avg: return "statBlue"
        case .hr: return "statRed"
        case .rbi: return "statGreen"
        case .era: return "statPurple"
        case .so: return "statOrange"
        case .sb: return "statTeal"
        }
    }
}

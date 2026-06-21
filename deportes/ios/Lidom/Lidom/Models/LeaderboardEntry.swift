import Foundation

struct LeaderboardResponse: Codable {
    let success: Bool
    let leaders: [LeaderboardEntry]
}

struct LeaderboardEntry: Codable, Identifiable {
    let id: Int
    let playerName: String
    let teamName: String?
    let statValue: String
    let gamesPlayed: Int?
    let teamId: Int?

    enum CodingKeys: String, CodingKey {
        case id
        case playerName = "player_name"
        case teamName = "team_name"
        case statValue = "stat_value"
        case gamesPlayed = "games_played"
        case teamId = "team_id"
    }
}

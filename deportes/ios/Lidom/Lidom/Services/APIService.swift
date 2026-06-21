import Foundation
import Combine

enum APIError: LocalizedError {
    case invalidURL
    case noData
    case decodingError(Error)
    case serverError(String)
    case networkError(Error)

    var errorDescription: String? {
        switch self {
        case .invalidURL: return "URL inválida"
        case .noData: return "No se recibieron datos"
        case .decodingError(let e): return "Error de datos: \(e.localizedDescription)"
        case .serverError(let m): return m
        case .networkError(let e): return "Error de red: \(e.localizedDescription)"
        }
    }
}

final class APIService: @unchecked Sendable {
    static let shared = APIService()

    private let baseURL = "http://localhost:3000/api"
    private let session: URLSession
    private let decoder: JSONDecoder

    private init() {
        let config = URLSessionConfiguration.default
        config.timeoutIntervalForRequest = 30
        config.waitsForConnectivity = true
        session = URLSession(configuration: config)

        decoder = JSONDecoder()
    }

    private func fetch<T: Decodable>(_ path: String, type: T.Type) -> AnyPublisher<T, Error> {
        fetch(path, query: [:], type: type)
    }

    private func fetch<T: Decodable>(_ path: String, query: [String: String], type: T.Type) -> AnyPublisher<T, Error> {
        var components = URLComponents(string: "\(baseURL)\(path)")
        if !query.isEmpty {
            components?.queryItems = query.map { URLQueryItem(name: $0.key, value: $0.value) }
        }
        guard let url = components?.url else {
            return Fail(error: APIError.invalidURL).eraseToAnyPublisher()
        }

        return session.dataTaskPublisher(for: url)
            .mapError { APIError.networkError($0) }
            .flatMap { data, response -> AnyPublisher<T, Error> in
                guard let httpResponse = response as? HTTPURLResponse else {
                    return Fail(error: APIError.serverError("Respuesta inválida")).eraseToAnyPublisher()
                }
                guard (200...299).contains(httpResponse.statusCode) else {
                    let msg = String(data: data, encoding: .utf8) ?? "Error \(httpResponse.statusCode)"
                    return Fail(error: APIError.serverError(msg)).eraseToAnyPublisher()
                }
                return Just(data)
                    .decode(type: T.self, decoder: self.decoder)
                    .mapError { APIError.decodingError($0) }
                    .eraseToAnyPublisher()
            }
            .eraseToAnyPublisher()
    }

    // MARK: - Seasons

    func getSeasons() -> AnyPublisher<SeasonsResponse, Error> {
        fetch("/standings/seasons", type: SeasonsResponse.self)
    }

    // MARK: - Player Endpoints

    func getPlayer(id: Int, season: String? = nil) -> AnyPublisher<PlayerProfileResponse, Error> {
        var q: [String: String] = [:]
        if let s = season { q["season"] = s }
        return fetch("/players/\(id)/profile", query: q, type: PlayerProfileResponse.self)
    }

    func getPlayerGames(id: Int, season: String? = nil) -> AnyPublisher<PlayerGamesResponse, Error> {
        var q: [String: String] = [:]
        if let s = season { q["season"] = s }
        return fetch("/players/\(id)/games", query: q, type: PlayerGamesResponse.self)
    }

    func getPlayerInsights(id: Int) -> AnyPublisher<PlayerInsightsResponse, Error> {
        fetch("/players/\(id)/insights", type: PlayerInsightsResponse.self)
    }

    func getPlayerStats(id: Int) -> AnyPublisher<PlayerStatsResponse, Error> {
        fetch("/players/\(id)/stats", type: PlayerStatsResponse.self)
    }

    // MARK: - Game Endpoints

    func getGame(id: Int) -> AnyPublisher<GameDetailResponse, Error> {
        fetch("/v1/games/\(id)", type: GameDetailResponse.self)
    }

    func getGameBoxScore(id: Int) -> AnyPublisher<BoxScoreResponse, Error> {
        fetch("/v1/games/\(id)/boxscore", type: BoxScoreResponse.self)
    }

    func getGameEvents(id: Int) -> AnyPublisher<EventsResponse, Error> {
        fetch("/v1/games/\(id)/events", type: EventsResponse.self)
    }

    func getGameLeaders(id: Int) -> AnyPublisher<LeadersResponse, Error> {
        fetch("/v1/games/\(id)/leaders", type: LeadersResponse.self)
    }

    // MARK: - List Endpoints

    func getPlayers() -> AnyPublisher<PlayersListResponse, Error> {
        fetch("/players", type: PlayersListResponse.self)
    }

    func getGames(season: String? = nil) -> AnyPublisher<MatchesListResponse, Error> {
        var q: [String: String] = [:]
        if let s = season { q["season"] = s }
        return fetch("/matches", query: q, type: MatchesListResponse.self)
    }

    // MARK: - Home Screen

    func getHomeScreen(league: String = "LIDOM") -> AnyPublisher<HomeScreenResponse, Error> {
        fetch("/home", query: ["league": league], type: HomeScreenResponse.self)
    }

    // MARK: - League Leaders

    func getBattingLeaders(category: String, season: String? = nil, limit: Int = 5) -> AnyPublisher<LeaderboardResponse, Error> {
        var q: [String: String] = ["category": category, "limit": "\(limit)"]
        if let s = season { q["season"] = s }
        return fetch("/lidom/leaders/batting", query: q, type: LeaderboardResponse.self)
    }

    func getPitchingLeaders(category: String, season: String? = nil, limit: Int = 5) -> AnyPublisher<LeaderboardResponse, Error> {
        var q: [String: String] = ["category": category, "limit": "\(limit)"]
        if let s = season { q["season"] = s }
        return fetch("/lidom/leaders/pitching", query: q, type: LeaderboardResponse.self)
    }
}

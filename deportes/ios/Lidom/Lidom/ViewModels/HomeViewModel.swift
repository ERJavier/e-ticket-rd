import Foundation
import Combine

@MainActor
final class HomeViewModel: ObservableObject {
    @Published var liveGames: [HomeGameCard] = []
    @Published var recentResults: [HomeGameCard] = []
    @Published var upcomingGames: [HomeGameCard] = []
    @Published var trendingPlayers: [TrendingPlayer] = []
    @Published var leagueLeaders: [LeagueLeader] = []

    @Published var isLoading = false
    @Published var error: String?

    @Published var selectedLeague: String = "LIDOM"
    @Published var leagues: [String] = ["LIDOM", "LNB", "LDF"]
    @Published var isSearchPresented = false

    private var cancellables = Set<AnyCancellable>()
    private let refreshInterval: TimeInterval = 30

    var hasLiveGames: Bool { !liveGames.isEmpty }
    var hasRecentResults: Bool { !recentResults.isEmpty }
    var hasUpcomingGames: Bool { !upcomingGames.isEmpty }
    var hasTrendingPlayers: Bool { !trendingPlayers.isEmpty }
    var hasLeagueLeaders: Bool { !leagueLeaders.isEmpty }

    var isEmpty: Bool {
        !hasLiveGames && !hasRecentResults && !hasUpcomingGames &&
        !hasTrendingPlayers && !hasLeagueLeaders
    }

    var liveGameIds: [Int] { liveGames.map { $0.id } }
    var recentResultIds: [Int] { recentResults.map { $0.id } }
    var upcomingGameIds: [Int] { upcomingGames.map { $0.id } }

    func loadHome() {
        isLoading = true
        error = nil

        APIService.shared.getHomeScreen(league: selectedLeague)
            .receive(on: DispatchQueue.main)
            .sink { [weak self] completion in
                self?.isLoading = false
                if case .failure(let e) = completion {
                    self?.error = e.localizedDescription
                }
            } receiveValue: { [weak self] response in
                guard let self else { return }
                liveGames = response.liveGames
                recentResults = response.recentResults
                upcomingGames = response.upcomingGames
                trendingPlayers = response.trendingPlayers
                leagueLeaders = response.leagueLeaders
            }
            .store(in: &cancellables)
    }

    func refresh() {
        loadHome()
    }

    func leaderTapped(_ category: LeaderCategory) {
    }
}

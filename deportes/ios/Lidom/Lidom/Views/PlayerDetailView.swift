import SwiftUI

struct PlayerDetailView: View {
    let playerId: Int
    let selectedSeason: String?
    @StateObject private var viewModel = PlayerDetailViewModel()

    init(playerId: Int, selectedSeason: String? = nil) {
        self.playerId = playerId
        self.selectedSeason = selectedSeason
    }

    var body: some View {
        Group {
            if viewModel.isLoading {
                LoadingStateView(message: "Cargando jugador...")
            } else if let error = viewModel.error {
                ErrorStateView(message: error) {
                    viewModel.refresh(id: playerId)
                }
            } else if let player = viewModel.player {
                ScrollView {
                    VStack(spacing: 0) {
                        headerSection(player: player)
                        heroStatsSection(stats: viewModel.heroStats)
                        if !viewModel.recentGames.isEmpty {
                            recentPerformanceSection(games: viewModel.recentGames)
                        }
                        seasonStatsSection()
                        gameLogSection(games: viewModel.gameLog)
                        if !viewModel.insights.isEmpty {
                            insightsSection(insights: viewModel.insights)
                        }
                        careerSection()
                    }
                }
                .background(LidomTheme.Colors.darkBackground.ignoresSafeArea())
                .navigationTitle(player.name)
                .navigationBarTitleDisplayMode(.inline)
                .toolbar {
                    ToolbarItem(placement: .principal) {
                        Text(player.name)
                            .font(LidomTheme.Typography.sectionTitle)
                            .foregroundColor(.white)
                    }
                }
            } else {
                EmptyStateView(title: "Jugador no encontrado")
            }
        }
        .onAppear {
            viewModel.selectedSeason = selectedSeason
            viewModel.loadPlayer(id: playerId)
        }
    }

    // MARK: - Header

    private func headerSection(player: Player) -> some View {
        VStack(spacing: 12) {
            ZStack {
                Circle()
                    .fill(LidomTheme.Colors.cardBackground)
                    .frame(width: 100, height: 100)
                Image(systemName: "person.circle.fill")
                    .font(.system(size: 100))
                    .foregroundColor(LidomTheme.Colors.primaryLight)
            }
            .overlay(
                Group {
                    if let team = player.currentTeam ?? player.teamName {
                        Text(String(team.prefix(2)).uppercased())
                            .font(.system(size: 10, weight: .bold))
                            .foregroundColor(.white)
                            .padding(4)
                            .background(LidomTheme.Colors.primary)
                            .clipShape(Circle())
                            .offset(x: 35, y: 35)
                    }
                }
            )

            Text(player.name)
                .font(LidomTheme.Typography.heroTitle)
                .foregroundColor(.white)

            HStack(spacing: 16) {
                if let team = player.currentTeam ?? player.teamName {
                    Label(team, systemImage: "baseball.fill")
                        .font(LidomTheme.Typography.body)
                        .foregroundColor(LidomTheme.Colors.textSecondary)
                }
                if let pos = player.primaryPositions ?? player.position {
                    Label(pos, systemImage: "figure.walk")
                        .font(LidomTheme.Typography.body)
                        .foregroundColor(LidomTheme.Colors.textSecondary)
                }
            }

            if let bats = player.bats, let throwsHand = player.throwsHand {
                HStack(spacing: 4) {
                    Badge(text: "Batea: \(bats.uppercased())")
                    Badge(text: "Lanza: \(throwsHand.uppercased())")
                }
                .font(LidomTheme.Typography.caption)
            }
        }
        .padding(.vertical, LidomTheme.Spacing.lg)
        .frame(maxWidth: .infinity)
    }

    // MARK: - Hero Stats

    private func heroStatsSection(stats: [(label: String, value: String)]) -> some View {
        VStack(spacing: 0) {
            SectionHeaderView(title: "Estadísticas Clave")
            LazyVGrid(columns: Array(repeating: GridItem(.flexible(), spacing: 8), count: min(stats.count, 4)), spacing: 8) {
                ForEach(stats, id: \.label) { stat in
                    StatCard(label: stat.label, value: stat.value, size: CGSize(width: 80, height: 60))
                }
            }
            .padding(.horizontal)
        }
        .padding(.bottom, 8)
    }

    // MARK: - Recent Performance

    private func recentPerformanceSection(games: [PlayerGameStat]) -> some View {
        VStack(spacing: 0) {
            SectionHeaderView(title: "Últimos 5 Juegos")
            VStack(spacing: 8) {
                ForEach(games) { game in
                    recentGameRow(game: game)
                }
            }
            .padding(.horizontal)
        }
        .padding(.bottom, 8)
    }

    private func recentGameRow(game: PlayerGameStat) -> some View {
        let isPitcherGame = game.inningsPitched != nil && game.inningsPitched! > 0
        return HStack {
            VStack(alignment: .leading, spacing: 2) {
                Text("vs \(game.opponentTeamName)")
                    .font(LidomTheme.Typography.body)
                    .foregroundColor(.white)
                Text(game.displayDate)
                    .font(LidomTheme.Typography.caption)
                    .foregroundColor(LidomTheme.Colors.textSecondary)
            }
            Spacer()
            if isPitcherGame {
                VStack(alignment: .trailing, spacing: 2) {
                    Text(game.inningsPitched.map { String(format: "%.1f IP", $0) } ?? "-")
                        .font(LidomTheme.Typography.body)
                        .foregroundColor(.white)
                    Text("\(game.strikeoutsPitched ?? 0) K, \(game.walksAllowed ?? 0) BB")
                        .font(LidomTheme.Typography.caption)
                        .foregroundColor(LidomTheme.Colors.textSecondary)
                }
            } else {
                VStack(alignment: .trailing, spacing: 2) {
                    Text("\(game.hits ?? 0)-\(game.atBats ?? 0)")
                        .font(LidomTheme.Typography.body)
                        .foregroundColor(.white)
                    Text("\(game.homeRuns ?? 0) HR, \(game.rbis ?? 0) RBI")
                        .font(LidomTheme.Typography.caption)
                        .foregroundColor(LidomTheme.Colors.textSecondary)
                }
            }
        }
        .padding(LidomTheme.Spacing.sm)
        .background(LidomTheme.Colors.cardBackground)
        .cornerRadius(LidomTheme.Layout.smallCornerRadius)
    }

    // MARK: - Season Stats

    private func seasonStatsSection() -> some View {
        VStack(spacing: 0) {
            let isPitcher = viewModel.isPitcher
            let bat = viewModel.seasonBatting
            let pitch = viewModel.enhancedPitching
            let hasBatting = bat != nil && (bat?.totalAtBats ?? 0) > 0
            let hasPitching = pitch != nil && (pitch?.gamesPitched ?? 0) > 0
            let sb = bat?.totalStolenBases ?? 0

            if hasBatting || hasPitching {
                SectionHeaderView(title: "Estadísticas de Temporada")

                if hasBatting, let batting = bat {
                    VStack(alignment: .leading, spacing: 8) {
                        Text("Bateo")
                            .font(LidomTheme.Typography.body)
                            .foregroundColor(LidomTheme.Colors.sectionHeader)
                            .padding(.horizontal)
                        CompactStatRow(items: [
                            ("AB", "\(batting.totalAtBats ?? 0)"),
                            ("R", "\(batting.totalRuns ?? 0)"),
                            ("H", "\(batting.totalHits ?? 0)"),
                            ("2B", "\(batting.totalDoubles ?? 0)"),
                            ("3B", "\(batting.totalTriples ?? 0)"),
                            ("HR", "\(batting.totalHomeRuns ?? 0)"),
                            ("RBI", "\(batting.totalRbis ?? 0)"),
                            ("BB", "\(batting.totalWalks ?? 0)"),
                            ("SO", "\(batting.totalStrikeouts ?? 0)"),
                            ("AVG", batting.battingAverage.map { String(format: ".%03d", Int($0 * 1000)) } ?? "-"),
                            ("OBP", batting.onBasePercentage.map { String(format: ".%03d", Int($0 * 1000)) } ?? "-"),
                            ("SLG", batting.sluggingPercentage.map { String(format: ".%03d", Int($0 * 1000)) } ?? "-"),
                        ])
                        .padding(.horizontal)
                    }
                    .padding(.bottom, 12)
                }

                if hasPitching, let pitching = pitch {
                    VStack(alignment: .leading, spacing: 8) {
                        Text("Pitcheo")
                            .font(LidomTheme.Typography.body)
                            .foregroundColor(LidomTheme.Colors.sectionHeader)
                            .padding(.horizontal)
                        CompactStatRow(items: [
                            ("IP", pitching.totalInningsPitched.map { String(format: "%.1f", $0) } ?? "-"),
                            ("H", "\(pitching.totalHitsAllowed ?? 0)"),
                            ("R", "\(pitching.totalRunsAllowed ?? 0)"),
                            ("ER", "\(pitching.totalEarnedRuns ?? 0)"),
                            ("BB", "\(pitching.totalWalksAllowed ?? 0)"),
                            ("SO", "\(pitching.totalStrikeoutsPitched ?? 0)"),
                            ("ERA", pitching.era.map { String(format: "%.2f", $0) } ?? "-"),
                            ("WHIP", pitching.whip.map { String(format: "%.2f", $0) } ?? "-"),
                        ])
                        .padding(.horizontal)
                    }
                    .padding(.bottom, 12)
                }

                if hasBatting, sb > 0 {
                    VStack(alignment: .leading, spacing: 8) {
                        Text("Base Running")
                            .font(LidomTheme.Typography.body)
                            .foregroundColor(LidomTheme.Colors.sectionHeader)
                            .padding(.horizontal)
                        CompactStatRow(items: [
                            ("SB", "\(sb)"),
                        ])
                        .padding(.horizontal)
                    }
                    .padding(.bottom, 12)
                }
            }
        }
        .padding(.bottom, 8)
    }

    // MARK: - Game Log

    private func gameLogSection(games: [PlayerGameStat]) -> some View {
        VStack(spacing: 0) {
            SectionHeaderView(title: "Juegos (\(games.count))")

            if viewModel.isLoadingGames {
                LoadingStateView(message: "Cargando juegos...")
            } else if let error = viewModel.gamesError {
                ErrorStateView(message: error)
            } else if games.isEmpty {
                EmptyStateView(title: "Sin juegos", message: "No hay juegos registrados para esta temporada")
            } else {
                VStack(spacing: 4) {
                    ForEach(games) { game in
                        gameLogRow(game: game)
                    }
                }
                .padding(.horizontal)
            }
        }
        .padding(.bottom, 8)
    }

    private func gameLogRow(game: PlayerGameStat) -> some View {
        let isPitcherGame = game.inningsPitched != nil && game.inningsPitched! > 0
        return HStack {
            VStack(alignment: .leading, spacing: 1) {
                Text(game.displayDate)
                    .font(LidomTheme.Typography.caption)
                    .foregroundColor(LidomTheme.Colors.textSecondary)
                Text("vs \(game.opponentTeamName)")
                    .font(LidomTheme.Typography.body)
                    .foregroundColor(.white)
            }
            Spacer()
            if isPitcherGame {
                HStack(spacing: 8) {
                    Text(game.inningsPitched.map { String(format: "%.1f", $0) } ?? "-")
                        .font(LidomTheme.Typography.caption)
                        .foregroundColor(LidomTheme.Colors.textSecondary)
                    Text("\(game.strikeoutsPitched ?? 0) K")
                        .font(LidomTheme.Typography.caption)
                        .foregroundColor(LidomTheme.Colors.textSecondary)
                    Text(game.era.map { String(format: "%.2f", $0) } ?? "-")
                        .font(LidomTheme.Typography.caption)
                        .foregroundColor(LidomTheme.Colors.textSecondary)
                }
            } else {
                Text("\(game.atBats ?? 0)-\(game.hits ?? 0), \(game.homeRuns ?? 0) HR, \(game.rbis ?? 0) RBI")
                    .font(LidomTheme.Typography.caption)
                    .foregroundColor(LidomTheme.Colors.textSecondary)
            }
        }
        .padding(.vertical, 6)
        .padding(.horizontal, 8)
        .background(LidomTheme.Colors.cardBackground)
        .cornerRadius(6)
    }

    // MARK: - Insights

    private func insightsSection(insights: [PlayerInsight]) -> some View {
        VStack(spacing: 0) {
            SectionHeaderView(title: "Perspectivas")

            ScrollView(.horizontal, showsIndicators: false) {
                HStack(spacing: 12) {
                    ForEach(insights) { insight in
                        insightCard(insight: insight)
                    }
                }
                .padding(.horizontal)
            }
        }
        .padding(.bottom, 8)
    }

    private func insightCard(insight: PlayerInsight) -> some View {
        VStack(alignment: .leading, spacing: 8) {
            HStack {
                Text(insight.emoji ?? "📊")
                    .font(.title2)
                Text(insight.title)
                    .font(LidomTheme.Typography.body)
                    .foregroundColor(.white)
            }
            Text(insight.description)
                .font(LidomTheme.Typography.caption)
                .foregroundColor(LidomTheme.Colors.textSecondary)
                .lineLimit(3)
        }
        .frame(width: 220)
        .padding()
        .background(LidomTheme.Colors.cardBackground)
        .cornerRadius(LidomTheme.Layout.cornerRadius)
    }

    // MARK: - Career

    private func careerSection() -> some View {
        VStack(spacing: 0) {
            if let stats = viewModel.careerStats {
                SectionHeaderView(title: "Trayectoria")

                if viewModel.isPitcher {
                    let items: [(String, String)] = [
                        ("J", "\(stats.careerGamesPlayed ?? 0)"),
                        ("IL", stats.careerInningsPitched.map { String(format: "%.1f", $0) } ?? "-"),
                        ("CL", "\(stats.careerEarnedRuns ?? 0)"),
                        ("K", "\(stats.careerStrikeoutsPitched ?? 0)"),
                        ("BB", "\(stats.careerWalks ?? 0)"),
                    ]
                    CompactStatRow(items: items)
                        .padding(.horizontal)

                    if let era = stats.careerEra {
                        HStack {
                            Text("ERA: \(String(format: "%.2f", era))")
                                .font(LidomTheme.Typography.body)
                                .foregroundColor(LidomTheme.Colors.secondary)
                            if let avg = stats.careerBattingAverage {
                                Text("AVG: \(String(format: ".%03d", Int(avg * 1000)))")
                                    .font(LidomTheme.Typography.body)
                                    .foregroundColor(LidomTheme.Colors.textSecondary)
                            }
                        }
                        .padding(.horizontal)
                        .padding(.top, 4)
                    }
                } else {
                    let items: [(String, String)] = [
                        ("J", "\(stats.careerGamesPlayed ?? 0)"),
                        ("VB", "\(stats.careerAtBats ?? 0)"),
                        ("H", "\(stats.careerHits ?? 0)"),
                        ("HR", "\(stats.careerHomeRuns ?? 0)"),
                        ("RBI", "\(stats.careerRbis ?? 0)"),
                        ("BR", "\(stats.careerStolenBases ?? 0)"),
                    ]
                    CompactStatRow(items: items)
                        .padding(.horizontal)

                    if let avg = stats.careerBattingAverage {
                        HStack {
                            Text("AVG: \(String(format: ".%03d", Int(avg * 1000)))")
                                .font(LidomTheme.Typography.body)
                                .foregroundColor(LidomTheme.Colors.secondary)
                            if let obp = stats.careerOnBasePercentage {
                                Text("OBP: \(String(format: ".%03d", Int(obp * 1000)))")
                                    .font(LidomTheme.Typography.body)
                                    .foregroundColor(LidomTheme.Colors.textSecondary)
                            }
                            if let slg = stats.careerSluggingPercentage {
                                Text("SLG: \(String(format: ".%03d", Int(slg * 1000)))")
                                    .font(LidomTheme.Typography.body)
                                    .foregroundColor(LidomTheme.Colors.textSecondary)
                            }
                        }
                        .padding(.horizontal)
                        .padding(.top, 4)
                    }
                }
            }
        }
        .padding(.bottom, 24)
    }
}

struct Badge: View {
    let text: String
    var body: some View {
        Text(text)
            .font(LidomTheme.Typography.small)
            .foregroundColor(LidomTheme.Colors.textSecondary)
            .padding(.horizontal, 8)
            .padding(.vertical, 3)
            .background(LidomTheme.Colors.surfaceBackground)
            .cornerRadius(4)
    }
}

import SwiftUI

struct HomeView: View {
    @StateObject private var viewModel = HomeViewModel()

    var body: some View {
        VStack(spacing: 0) {
            HomeHeaderView(
                selectedLeague: $viewModel.selectedLeague,
                leagues: viewModel.leagues,
                onSearchTap: { viewModel.isSearchPresented = true }
            )

            if viewModel.isLoading && viewModel.isEmpty {
                Spacer()
                LoadingStateView(message: "Cargando...")
                Spacer()
            } else if let error = viewModel.error, viewModel.isEmpty {
                Spacer()
                ErrorStateView(message: error) {
                    viewModel.refresh()
                }
                Spacer()
            } else {
                ScrollView(.vertical, showsIndicators: false) {
                    VStack(spacing: 20) {
                        if viewModel.hasLiveGames {
                            liveGamesSection
                        }

                        if viewModel.hasRecentResults {
                            recentResultsSection
                        }

                        if viewModel.hasUpcomingGames {
                            upcomingGamesSection
                        }

                        if viewModel.hasTrendingPlayers {
                            trendingPlayersSection
                        }

                        if viewModel.hasLeagueLeaders {
                            leagueLeadersSection
                        }

                        if viewModel.isEmpty && !viewModel.isLoading {
                            EmptyStateView(
                                title: "No hay contenido disponible",
                                message: "No hay juegos ni datos para la liga seleccionada",
                                icon: "baseball"
                            )
                            .padding(.top, 40)
                        }

                        Color.clear.frame(height: 20)
                    }
                }
                .refreshable { viewModel.refresh() }
            }
        }
        .background(LidomTheme.Colors.darkBackground.ignoresSafeArea())
        .onAppear { viewModel.loadHome() }
        .onChange(of: viewModel.selectedLeague) { _ in viewModel.loadHome() }
        .sheet(isPresented: $viewModel.isSearchPresented) {
            searchSheet
        }
    }

    // MARK: - Live Games

    private var liveGamesSection: some View {
        VStack(spacing: 10) {
            LiveSectionHeader()

            ScrollView(.horizontal, showsIndicators: false) {
                HStack(spacing: 12) {
                    ForEach(viewModel.liveGames) { game in
                        LiveGameCard(game: game)
                    }
                }
                .padding(.horizontal)
            }
        }
    }

    // MARK: - Recent Results

    private var recentResultsSection: some View {
        VStack(spacing: 10) {
            SectionHeaderAction(title: "Resultados") {
            }

            VStack(spacing: 8) {
                ForEach(viewModel.recentResults) { game in
                    GameResultRow(game: game)
                }
            }
            .padding(.horizontal)
        }
    }

    // MARK: - Upcoming Games

    private var upcomingGamesSection: some View {
        VStack(spacing: 10) {
            SectionHeaderAction(title: "Próximos Juegos") {
            }

            ScrollView(.horizontal, showsIndicators: false) {
                HStack(spacing: 12) {
                    ForEach(viewModel.upcomingGames) { game in
                        UpcomingGameCard(game: game)
                    }
                }
                .padding(.horizontal)
            }
        }
    }

    // MARK: - Trending Players

    private var trendingPlayersSection: some View {
        VStack(spacing: 10) {
            SectionHeaderAction(title: "Jugadores Destacados") {
            }

            ScrollView(.horizontal, showsIndicators: false) {
                HStack(spacing: 12) {
                    ForEach(viewModel.trendingPlayers) { player in
                        TrendingPlayerCard(player: player)
                    }
                }
                .padding(.horizontal)
            }
        }
    }

    // MARK: - League Leaders

    private var leagueLeadersSection: some View {
        VStack(spacing: 10) {
            SectionHeaderAction(title: "Líderes de la Liga") {
            }

            LazyVGrid(
                columns: Array(repeating: GridItem(.flexible(), spacing: 10), count: 3),
                spacing: 10
            ) {
                ForEach(viewModel.leagueLeaders) { leader in
                    LeagueLeaderCard(leader: leader)
                }
            }
            .padding(.horizontal)
        }
    }

    // MARK: - Search Sheet

    private var searchSheet: some View {
        NavigationStack {
            PlayerListView()
                .navigationTitle("Buscar")
                .toolbar {
                    ToolbarItem(placement: .cancellationAction) {
                        Button("Cerrar") {
                            viewModel.isSearchPresented = false
                        }
                    }
                }
        }
    }
}

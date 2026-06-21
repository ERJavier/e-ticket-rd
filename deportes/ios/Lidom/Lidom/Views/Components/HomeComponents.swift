import SwiftUI

struct HomeHeaderView: View {
    @Binding var selectedLeague: String
    let leagues: [String]
    var onSearchTap: () -> Void

    var body: some View {
        HStack(spacing: 12) {
            HStack(spacing: 8) {
                Image(systemName: "baseball.fill")
                    .font(.system(size: 22, weight: .bold))
                    .foregroundColor(LidomTheme.Colors.secondary)
                Text("LIDOM")
                    .font(.system(size: 20, weight: .heavy, design: .rounded))
                    .foregroundColor(.white)
            }

            Spacer()

            Menu {
                ForEach(leagues, id: \.self) { league in
                    Button {
                        selectedLeague = league
                    } label: {
                        HStack {
                            Text(league)
                            if league == selectedLeague {
                                Image(systemName: "checkmark")
                            }
                        }
                    }
                }
            } label: {
                HStack(spacing: 6) {
                    Circle()
                        .fill(LidomTheme.Colors.primaryLight)
                        .frame(width: 6, height: 6)
                    Text(selectedLeague)
                        .font(.system(size: 14, weight: .semibold, design: .rounded))
                    Image(systemName: "chevron.down")
                        .font(.system(size: 10, weight: .bold))
                }
                .foregroundColor(.white)
                .padding(.horizontal, 12)
                .padding(.vertical, 8)
                .background(LidomTheme.Colors.cardBackground)
                .cornerRadius(20)
            }

            Button {
                onSearchTap()
            } label: {
                Image(systemName: "magnifyingglass")
                    .font(.system(size: 16, weight: .semibold))
                    .foregroundColor(.white)
                    .padding(10)
                    .background(LidomTheme.Colors.cardBackground)
                    .clipShape(Circle())
            }
        }
        .padding(.horizontal)
        .padding(.vertical, 12)
    }
}

struct LiveGameCard: View {
    let game: HomeGameCard

    var body: some View {
        NavigationLink(destination: MatchDetailView(gameId: game.id)) {
            VStack(spacing: 0) {
                HStack {
                    Circle()
                        .fill(Color.red)
                        .frame(width: 8, height: 8)
                    Text("EN VIVO")
                        .font(.system(size: 11, weight: .bold, design: .rounded))
                        .foregroundColor(Color.red)
                    Spacer()
                    if let inning = game.inning {
                        Text(inning)
                            .font(.system(size: 12, weight: .semibold, design: .rounded))
                            .foregroundColor(LidomTheme.Colors.textSecondary)
                    }
                    if let outs = game.outs {
                        Text("\(outs) outs")
                            .font(.system(size: 12, weight: .semibold, design: .rounded))
                            .foregroundColor(LidomTheme.Colors.textSecondary)
                    }
                }
                .padding(.horizontal, 14)
                .padding(.top, 12)

                VStack(spacing: 8) {
                    TeamScoreRow(team: game.awayTeam, score: game.awayScore, isWinner: false)
                    TeamScoreRow(team: game.homeTeam, score: game.homeScore, isWinner: false)
                }
                .padding(.horizontal, 14)
                .padding(.vertical, 10)
            }
            .frame(width: 220)
            .background(LidomTheme.Colors.cardBackground)
            .cornerRadius(LidomTheme.Layout.cornerRadius)
            .overlay(
                RoundedRectangle(cornerRadius: LidomTheme.Layout.cornerRadius)
                    .stroke(Color.red.opacity(0.3), lineWidth: 1)
            )
        }
        .buttonStyle(.plain)
    }
}

struct TeamScoreRow: View {
    let team: HomeTeamInfo
    let score: Int
    let isWinner: Bool

    var body: some View {
        HStack(spacing: 10) {
            AsyncImage(url: team.logoUrl.flatMap { URL(string: $0) }) { phase in
                switch phase {
                case .success(let image):
                    image.resizable().scaledToFit()
                default:
                    ZStack {
                        Circle()
                            .fill(LidomTheme.Colors.surfaceBackground)
                        Text(team.shortName?.prefix(1).uppercased() ?? team.name.prefix(1).uppercased())
                            .font(.system(size: 14, weight: .bold, design: .rounded))
                            .foregroundColor(LidomTheme.Colors.textSecondary)
                    }
                }
            }
            .frame(width: 28, height: 28)

            Text(team.shortName ?? team.name)
                .font(.system(size: 14, weight: .semibold, design: .rounded))
                .foregroundColor(.white)
                .lineLimit(1)

            Spacer()

            Text("\(score)")
                .font(.system(size: 22, weight: .bold, design: .monospaced))
                .foregroundColor(isWinner ? LidomTheme.Colors.secondary : .white)
        }
    }
}

struct GameResultRow: View {
    let game: HomeGameCard

    var body: some View {
        NavigationLink(destination: MatchDetailView(gameId: game.id)) {
            HStack(spacing: 0) {
                VStack(alignment: .leading, spacing: 6) {
                    HStack(spacing: 10) {
                        AsyncImage(url: game.awayTeam.logoUrl.flatMap { URL(string: $0) }) { phase in
                            switch phase {
                            case .success(let image):
                                image.resizable().scaledToFit().frame(width: 20, height: 20)
                            default:
                                Text(game.awayTeam.shortName?.prefix(1).uppercased() ?? "")
                                    .font(.caption)
                                    .foregroundColor(LidomTheme.Colors.textSecondary)
                                    .frame(width: 20, height: 20)
                                    .background(LidomTheme.Colors.surfaceBackground)
                                    .clipShape(Circle())
                            }
                        }
                        Text(game.awayTeam.shortName ?? game.awayTeam.name)
                            .font(.system(size: 14, weight: game.winnerName == game.awayTeam.name ? .bold : .regular, design: .rounded))
                            .foregroundColor(game.winnerName == game.awayTeam.name ? .white : LidomTheme.Colors.textSecondary)
                        Spacer()
                        Text("\(game.awayScore)")
                            .font(.system(size: 18, weight: .bold, design: .monospaced))
                            .foregroundColor(game.winnerName == game.awayTeam.name ? .white : LidomTheme.Colors.textSecondary)
                    }

                    HStack(spacing: 10) {
                        AsyncImage(url: game.homeTeam.logoUrl.flatMap { URL(string: $0) }) { phase in
                            switch phase {
                            case .success(let image):
                                image.resizable().scaledToFit().frame(width: 20, height: 20)
                            default:
                                Text(game.homeTeam.shortName?.prefix(1).uppercased() ?? "")
                                    .font(.caption)
                                    .foregroundColor(LidomTheme.Colors.textSecondary)
                                    .frame(width: 20, height: 20)
                                    .background(LidomTheme.Colors.surfaceBackground)
                                    .clipShape(Circle())
                            }
                        }
                        Text(game.homeTeam.shortName ?? game.homeTeam.name)
                            .font(.system(size: 14, weight: game.winnerName == game.homeTeam.name ? .bold : .regular, design: .rounded))
                            .foregroundColor(game.winnerName == game.homeTeam.name ? .white : LidomTheme.Colors.textSecondary)
                        Spacer()
                        Text("\(game.homeScore)")
                            .font(.system(size: 18, weight: .bold, design: .monospaced))
                            .foregroundColor(game.winnerName == game.homeTeam.name ? .white : LidomTheme.Colors.textSecondary)
                    }
                }

                Divider()
                    .background(LidomTheme.Colors.separator)
                    .frame(height: 44)
                    .padding(.leading, 12)

                VStack(alignment: .trailing, spacing: 4) {
                    Text("FINAL")
                        .font(.system(size: 10, weight: .bold, design: .rounded))
                        .foregroundColor(LidomTheme.Colors.secondary)
                        .padding(.horizontal, 8)
                        .padding(.vertical, 3)
                        .background(LidomTheme.Colors.secondary.opacity(0.15))
                        .cornerRadius(4)

                    Text(game.displayDate)
                        .font(.system(size: 11, weight: .regular, design: .rounded))
                        .foregroundColor(LidomTheme.Colors.textSecondary)
                }
                .frame(width: 72)
                .padding(.leading, 8)
            }
            .padding(.horizontal, 14)
            .padding(.vertical, 10)
            .background(LidomTheme.Colors.cardBackground)
            .cornerRadius(LidomTheme.Layout.cornerRadius)
        }
        .buttonStyle(.plain)
    }
}

struct UpcomingGameCard: View {
    let game: HomeGameCard

    var body: some View {
        NavigationLink(destination: MatchDetailView(gameId: game.id)) {
            VStack(spacing: 14) {
                Text(game.displayDate)
                    .font(.system(size: 11, weight: .semibold, design: .rounded))
                    .foregroundColor(LidomTheme.Colors.textSecondary)

                VStack(spacing: 10) {
                    HStack(spacing: 8) {
                        AsyncImage(url: game.awayTeam.logoUrl.flatMap { URL(string: $0) }) { phase in
                            switch phase {
                            case .success(let image):
                                image.resizable().scaledToFit()
                            default:
                                Text(game.awayTeam.shortName?.prefix(1).uppercased() ?? "")
                                    .font(.caption)
                                    .foregroundColor(LidomTheme.Colors.textSecondary)
                                    .frame(maxWidth: .infinity, maxHeight: .infinity)
                                    .background(LidomTheme.Colors.surfaceBackground)
                                    .clipShape(Circle())
                            }
                        }
                        .frame(width: 32, height: 32)

                        Text(game.awayTeam.shortName ?? game.awayTeam.name)
                            .font(.system(size: 13, weight: .semibold, design: .rounded))
                            .foregroundColor(.white)
                    }

                    Text("VS")
                        .font(.system(size: 10, weight: .bold, design: .rounded))
                        .foregroundColor(LidomTheme.Colors.textSecondary)

                    HStack(spacing: 8) {
                        AsyncImage(url: game.homeTeam.logoUrl.flatMap { URL(string: $0) }) { phase in
                            switch phase {
                            case .success(let image):
                                image.resizable().scaledToFit()
                            default:
                                Text(game.homeTeam.shortName?.prefix(1).uppercased() ?? "")
                                    .font(.caption)
                                    .foregroundColor(LidomTheme.Colors.textSecondary)
                                    .frame(maxWidth: .infinity, maxHeight: .infinity)
                                    .background(LidomTheme.Colors.surfaceBackground)
                                    .clipShape(Circle())
                            }
                        }
                        .frame(width: 32, height: 32)

                        Text(game.homeTeam.shortName ?? game.homeTeam.name)
                            .font(.system(size: 13, weight: .semibold, design: .rounded))
                            .foregroundColor(.white)
                    }
                }

                if let venue = game.venue {
                    Text(venue)
                        .font(.system(size: 10, weight: .regular, design: .rounded))
                        .foregroundColor(LidomTheme.Colors.textSecondary)
                        .lineLimit(1)
                }
            }
            .frame(width: 160)
            .padding(.vertical, 14)
            .padding(.horizontal, 12)
            .background(LidomTheme.Colors.cardBackground)
            .cornerRadius(LidomTheme.Layout.cornerRadius)
        }
        .buttonStyle(.plain)
    }
}

struct TrendingPlayerCard: View {
    let player: TrendingPlayer

    var body: some View {
        NavigationLink(destination: PlayerDetailView(playerId: player.id)) {
            VStack(spacing: 0) {
                ZStack(alignment: .bottomTrailing) {
                    AsyncImage(url: player.photoUrl.flatMap { URL(string: $0) }) { phase in
                        switch phase {
                        case .success(let image):
                            image.resizable().scaledToFill()
                        default:
                            ZStack {
                                LinearGradient(
                                    colors: [LidomTheme.Colors.primaryLight, LidomTheme.Colors.primary],
                                    startPoint: .topLeading,
                                    endPoint: .bottomTrailing
                                )
                                Text(player.name.prefix(1).uppercased())
                                    .font(.system(size: 32, weight: .bold, design: .rounded))
                                    .foregroundColor(.white)
                            }
                        }
                    }
                    .frame(width: 160, height: 140)
                    .clipped()

                    AsyncImage(url: player.teamLogoUrl.flatMap { URL(string: $0) }) { phase in
                        switch phase {
                        case .success(let image):
                            image.resizable().scaledToFit().frame(width: 24, height: 24)
                        default:
                            EmptyView()
                        }
                    }
                    .padding(6)
                    .background(Circle().fill(LidomTheme.Colors.cardBackground))
                    .offset(x: -6, y: -6)
                }

                VStack(alignment: .leading, spacing: 4) {
                    Text(player.name)
                        .font(.system(size: 13, weight: .bold, design: .rounded))
                        .foregroundColor(.white)
                        .lineLimit(1)

                    HStack(spacing: 4) {
                        if let pos = player.position {
                            Text(pos)
                                .font(.system(size: 10, weight: .medium, design: .rounded))
                                .foregroundColor(LidomTheme.Colors.textSecondary)
                        }
                        if let team = player.teamName {
                            Text(team)
                                .font(.system(size: 10, weight: .medium, design: .rounded))
                                .foregroundColor(LidomTheme.Colors.textSecondary)
                                .lineLimit(1)
                        }
                    }

                    HStack(spacing: 4) {
                        Text(player.keyStat)
                            .font(.system(size: 10, weight: .medium, design: .rounded))
                            .foregroundColor(LidomTheme.Colors.textSecondary)
                        Text(player.statValue)
                            .font(.system(size: 16, weight: .bold, design: .monospaced))
                            .foregroundColor(LidomTheme.Colors.secondary)
                    }

                    if let recent = player.recentGames, !recent.isEmpty {
                        HStack(spacing: 3) {
                            ForEach(recent.prefix(5), id: \.statLine) { game in
                                Text(game.statLine)
                                    .font(.system(size: 8, weight: .semibold, design: .monospaced))
                                    .foregroundColor(.white)
                                    .padding(.horizontal, 4)
                                    .padding(.vertical, 2)
                                    .background(LidomTheme.Colors.surfaceBackground)
                                    .cornerRadius(3)
                            }
                        }
                    }
                }
                .padding(.horizontal, 10)
                .padding(.vertical, 8)
            }
            .frame(width: 160)
            .background(LidomTheme.Colors.cardBackground)
            .cornerRadius(LidomTheme.Layout.cornerRadius)
        }
        .buttonStyle(.plain)
    }
}

struct LeagueLeaderCard: View {
    let leader: LeagueLeader

    var body: some View {
        NavigationLink(destination: PlayerDetailView(playerId: leader.playerId)) {
            VStack(spacing: 8) {
                HStack(spacing: 6) {
                    Image(systemName: leader.category.systemImage)
                        .font(.system(size: 12, weight: .semibold))
                        .foregroundColor(LidomTheme.Colors.secondary)
                    Text(leader.category.rawValue)
                        .font(.system(size: 13, weight: .bold, design: .rounded))
                        .foregroundColor(.white)
                }

                Text(leader.statValue)
                    .font(.system(size: 28, weight: .bold, design: .monospaced))
                    .foregroundColor(LidomTheme.Colors.secondary)

                Text(leader.playerName)
                    .font(.system(size: 12, weight: .semibold, design: .rounded))
                    .foregroundColor(.white)
                    .lineLimit(1)

                if let team = leader.teamName {
                    Text(team)
                        .font(.system(size: 10, weight: .regular, design: .rounded))
                        .foregroundColor(LidomTheme.Colors.textSecondary)
                        .lineLimit(1)
                }
            }
            .frame(maxWidth: .infinity)
            .padding(.vertical, 14)
            .padding(.horizontal, 8)
            .background(LidomTheme.Colors.cardBackground)
            .cornerRadius(LidomTheme.Layout.cornerRadius)
        }
        .buttonStyle(.plain)
    }
}

struct LiveSectionHeader: View {
    var body: some View {
        HStack(spacing: 8) {
            Circle()
                .fill(Color.red)
                .frame(width: 8, height: 8)
            Text("En Vivo")
                .font(.system(size: 18, weight: .bold, design: .rounded))
                .foregroundColor(.white)
            Spacer()
        }
        .padding(.horizontal)
        .padding(.vertical, 4)
    }
}

struct SectionHeader<Destination: View>: View {
    let title: String
    var showAll: Bool = false
    var destination: Destination?

    var body: some View {
        HStack {
            Text(title)
                .font(.system(size: 18, weight: .bold, design: .rounded))
                .foregroundColor(.white)
            Spacer()
            if showAll, let dest = destination {
                NavigationLink(destination: dest) {
                    HStack(spacing: 4) {
                        Text("Ver todos")
                            .font(.system(size: 13, weight: .medium, design: .rounded))
                        Image(systemName: "chevron.right")
                            .font(.system(size: 10, weight: .bold))
                    }
                    .foregroundColor(LidomTheme.Colors.textSecondary)
                }
            }
        }
        .padding(.horizontal)
        .padding(.vertical, 4)
    }
}

struct SectionHeaderAction: View {
    let title: String
    var showAll: Bool = false
    var action: (() -> Void)?

    var body: some View {
        HStack {
            Text(title)
                .font(.system(size: 18, weight: .bold, design: .rounded))
                .foregroundColor(.white)
            Spacer()
            if showAll, let action = action {
                Button {
                    action()
                } label: {
                    HStack(spacing: 4) {
                        Text("Ver todos")
                            .font(.system(size: 13, weight: .medium, design: .rounded))
                        Image(systemName: "chevron.right")
                            .font(.system(size: 10, weight: .bold))
                    }
                    .foregroundColor(LidomTheme.Colors.textSecondary)
                }
            }
        }
        .padding(.horizontal)
        .padding(.vertical, 4)
    }
}

struct SectionDivider: View {
    var body: some View {
        Divider()
            .background(LidomTheme.Colors.separator)
            .padding(.vertical, 4)
    }
}

struct EmptySectionView: View {
    let icon: String
    let title: String
    let message: String

    var body: some View {
        VStack(spacing: 10) {
            Image(systemName: icon)
                .font(.system(size: 28))
                .foregroundColor(LidomTheme.Colors.textSecondary)
            Text(title)
                .font(.system(size: 14, weight: .semibold, design: .rounded))
                .foregroundColor(LidomTheme.Colors.textSecondary)
            Text(message)
                .font(.system(size: 12, weight: .regular, design: .rounded))
                .foregroundColor(LidomTheme.Colors.textSecondary.opacity(0.7))
                .multilineTextAlignment(.center)
        }
        .frame(maxWidth: .infinity)
        .padding(.vertical, 24)
    }
}

import SwiftUI

@main
struct LidomApp: App {
    var body: some Scene {
        WindowGroup {
            ContentView()
        }
    }
}

struct ContentView: View {
    var body: some View {
        TabView {
            NavigationStack {
                HomeView()
                    .navigationTitle("Inicio")
                    .toolbar(.hidden, for: .navigationBar)
            }
            .tabItem {
                Label("Inicio", systemImage: "baseball.fill")
            }

            NavigationStack {
                GameListView()
                    .navigationTitle("Juegos")
            }
            .tabItem {
                Label("Juegos", systemImage: "list.star")
            }

            NavigationStack {
                PlayerListView()
                    .navigationTitle("Jugadores")
            }
            .tabItem {
                Label("Jugadores", systemImage: "person.fill")
            }
        }
        .tint(LidomTheme.Colors.primary)
    }
}

#Preview {
    ContentView()
}

import Foundation

enum AppConfig {
    static var appURL: URL {
        let configuredURL = Bundle.main.object(forInfoDictionaryKey: "InternalAppURL") as? String
        let fallbackURL = "https://hr.company.local"
        return URL(string: configuredURL?.isEmpty == false ? configuredURL! : fallbackURL)!
    }
}

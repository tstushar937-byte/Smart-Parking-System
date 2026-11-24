
package smartparking.dto;

public class AdminSetupRequest {

    private String name;
    private String email;
    private String password;
    private String setupSecret;

    public AdminSetupRequest() {
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getSetupSecret() {
        return setupSecret;
    }

    public void setSetupSecret(String setupSecret) {
        this.setupSecret = setupSecret;
    }
}

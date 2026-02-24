{
  description = "Flake for dev shell each default system";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-25.11";
    flake-utils.url = "github:numtide/flake-utils";
  };
  outputs = { self, nixpkgs, flake-utils }:
    flake-utils.lib.eachDefaultSystem (system:
      let pkgs = nixpkgs.legacyPackages.${system}; in rec {
        packages.cra = import ./apps/cra/shell.nix {inherit pkgs;};  ## TODO  real package
        packages.next = import ./apps/web/shell.nix {inherit pkgs;};  ## TODO  real package
        packages.test-gh-pages-workflow = pkgs.writeShellScriptBin "test-gh-pages-workflow" ''
          echo "Testing GitHub Pages workflow with act..."
          ${pkgs.act}/bin/act -W .github/workflows/pages.yml --job build -P ubuntu-24.04=catthehacker/ubuntu:act-latest --env GITHUB_TOKEN=fake_token
        '';
        packages.default = packages.next;

        devShells.default = pkgs.mkShell {
          buildInputs = with pkgs; [ 
            nodejs_latest
            nodePackages_latest.pnpm
          ];
        };
      }
    );
}

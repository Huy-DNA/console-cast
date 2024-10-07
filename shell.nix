{ pkgs ? import <nixpkgs> { } }:

pkgs.mkShell {
  packages = with pkgs; [
    postgresql_16
    bun
    dbmate
    neovim
    zsh
  ];

  PGDATA = "./.data";
  
  shellHook = ''
    initdb
    pg_ctl start
    createdb
    echo "To start, run \`bun db:create\` and then \`bun db:migrate\`"
    alias vim=nvim
  '';
}

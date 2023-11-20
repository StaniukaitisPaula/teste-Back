"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.peneiraRepository = exports.notificacaoRepository = exports.propostaRepository = exports.postagemRepository = exports.timeRepository = exports.userRepository = exports.jogadorRepository = void 0;
const data_source_1 = require("../data-source");
const User_1 = require("../entities/User");
exports.jogadorRepository = data_source_1.AppDataSource.getRepository(User_1.Jogador);
exports.userRepository = data_source_1.AppDataSource.getRepository(User_1.Perfil);
exports.timeRepository = data_source_1.AppDataSource.getRepository(User_1.Time);
exports.postagemRepository = data_source_1.AppDataSource.getRepository(User_1.Postagem);
exports.propostaRepository = data_source_1.AppDataSource.getRepository(User_1.Proposta);
exports.notificacaoRepository = data_source_1.AppDataSource.getRepository(User_1.Notificacao);
exports.peneiraRepository = data_source_1.AppDataSource.getRepository(User_1.Peneira);

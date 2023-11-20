"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TimeController = void 0;
const api_erros_1 = require("../helpers/api-erros");
const UserRepository_1 = require("../repositories/UserRepository");
const User_1 = require("../entities/User");
class TimeController {
    //GET
    async getTime(req, res) {
        const user = req.user;
        let team = [new User_1.Time];
        if (req.user) {
            let teamResponse = await UserRepository_1.timeRepository.findBy({ dono: req.user });
            if (teamResponse) {
                team = teamResponse;
            }
            else {
                throw new api_erros_1.BadRequestError('Usuario sem organização');
            }
        }
        else {
            throw new api_erros_1.BadRequestError('Usuario sem organização');
        }
        const response = { user: user, time: team[0] ? team : false };
        return res.json(response);
    }
    async getTimeFilter(req, res) {
        let perPage = req.query.perPage;
        let page = req.query.page;
        const perPageNumber = parseInt(perPage);
        const pagenumber = parseInt(page);
        const skip = (perPageNumber * pagenumber) - perPageNumber;
        let teamResponse = [new User_1.Time];
        let teamfilter = [new User_1.Time];
        let name = req.query.name;
        if (!isNaN(perPageNumber) && !isNaN(pagenumber)) {
            teamResponse = await UserRepository_1.timeRepository.find({ relations: { dono: true }, take: perPageNumber, skip: skip });
        }
        else {
            teamResponse = await UserRepository_1.timeRepository.find({ relations: { dono: true, jogadores: { perfil_id: true } } });
        }
        //console.log(teamResponse);
        if (name != undefined && name != "") {
            teamfilter = teamResponse.filter((x) => { if (x.nome_time.toLowerCase().startsWith(name.toLocaleLowerCase()))
                return x; });
            teamResponse = teamfilter;
        }
        if (req.params.id) {
            teamfilter = teamResponse.filter((x) => { if (x.id == parseInt(req.params.id))
                return x; });
            // console.log(teamfilter);
            teamResponse = teamfilter;
        }
        let timeCount = await UserRepository_1.timeRepository.count();
        const response = { teams: teamResponse, limit: timeCount };
        return res.json(response);
    }
    async getTimeFilterUser(req, res) {
        let perfil = new User_1.Perfil;
        let responsee = false;
        if (req.params.id) {
            let orgResponse = await UserRepository_1.userRepository.findOneBy({ id: parseInt(req.params.id) });
            if (orgResponse) {
                perfil = orgResponse;
                let teamResponse = await UserRepository_1.timeRepository.find({ where: { dono: perfil } });
                const response = { teams: teamResponse };
                return res.json(response);
            }
        }
        const response = { teams: responsee };
        return res.json(response);
    }
    //POST 
    async createTime(req, res) {
        const user = req.user;
        const { nome_time, biografia, jogo, } = req.body;
        if (nome_time == undefined || nome_time == "" ||
            biografia == undefined || biografia == "" ||
            jogo == undefined || jogo == "")
            throw new api_erros_1.BadRequestError('JSON invalido, Faltam Informacoes!');
        const nametimeExists = await UserRepository_1.timeRepository.findOneBy({ nome_time });
        if (nametimeExists) {
            throw new api_erros_1.BadRequestError('Nome de Time ja cadastrado!');
        }
        const newTime = UserRepository_1.timeRepository.create({
            dono: user,
            nome_time,
            biografia,
            jogo
        });
        await UserRepository_1.timeRepository.save(newTime);
        return res.status(201).json(newTime);
    }
    async insertJogador(req, res) {
        const idTime = parseInt(req.params.time);
        const idJogador = parseInt(req.params.jogador);
        if (idTime == undefined ||
            idJogador == undefined ||
            isNaN(idTime) || isNaN(idJogador))
            throw new api_erros_1.BadRequestError('Faltam Informacoes!');
        const time = await UserRepository_1.timeRepository.findOne({ where: { id: idTime }, relations: { dono: true } });
        if (!time || time.dono.id != req.user.id)
            throw new api_erros_1.BadRequestError('Esse time não exite ou não pertece a essa organização!');
        const jogador = await UserRepository_1.jogadorRepository.findOne({ where: { perfil_id: { id: idJogador } }, relations: { perfil_id: true, time_atual: true } });
        console.log(jogador);
        if (!jogador)
            throw new api_erros_1.BadRequestError('Jogador não exite!');
        if (jogador.time_atual)
            throw new api_erros_1.BadRequestError('Jogador já tem time!');
        let jogadores = time.jogadores;
        jogadores ? jogadores.push(jogador) : jogadores = [jogador];
        if (jogadores.length > 10)
            throw new api_erros_1.BadRequestError('Time atigil o limite de jogadores');
        time.jogadores = jogadores;
        const a = await UserRepository_1.timeRepository.save(time);
        return res.json({
            added: a
        });
    }
    //UPDATE TIME
    async updateTime(req, res) {
        const id = req.params.id;
        const times = await UserRepository_1.timeRepository.findOne({ relations: { dono: true }, where: { dono: { id: req.user.id }, id: parseInt(id) }, select: { dono: { id: false } } });
        // console.log(times);
        if (times) {
            const { nome_time, biografia, } = req.body;
            // console.log(nome_time);
            let response = {
                nome_time,
                biografia,
            };
            if (nome_time) {
                response.nome_time = Boolean((await UserRepository_1.timeRepository.update({ id: times.id }, { nome_time: nome_time })).affected);
            }
            if (biografia) {
                response.biografia = Boolean((await UserRepository_1.timeRepository.update({ id: times.id }, { biografia: biografia })).affected);
            }
        }
        else {
            throw new api_erros_1.BadRequestError('Id nao informado ou nao ha org!');
        }
        return res.json({
            response: true
        });
    }
    // DELETE
    async deleteTime(req, res) {
        const user = req.user;
        const id = req.params.id;
        // console.log(org);
        // console.log(id)
        if (id == null || user == undefined)
            throw new api_erros_1.BadRequestError('Id nao informado!');
        const time = await UserRepository_1.timeRepository.findOneBy({ id: parseInt(id), dono: user });
        if (time) {
            await UserRepository_1.timeRepository.delete({ id: time.id });
        }
        return res.json({
            deleted: true
        });
    }
    async deleteJogador(req, res) {
        const idTime = parseInt(req.params.time);
        const idJogador = parseInt(req.params.jogador);
        if (idTime == undefined ||
            idJogador == undefined ||
            isNaN(idTime) || isNaN(idJogador))
            throw new api_erros_1.BadRequestError('Faltam Informacoes!');
        const time = await UserRepository_1.timeRepository.findOne({ where: { id: idTime }, relations: { dono: true } });
        if (!time || time.dono.id != req.user.id)
            throw new api_erros_1.BadRequestError('Esse time não exite ou não pertece a esse perfil!');
        const jogador = await UserRepository_1.jogadorRepository.findOne({ where: { perfil_id: { id: idJogador } } });
        console.log(jogador);
        if (!jogador)
            throw new api_erros_1.BadRequestError('Jogador não exite!');
        let jogadores = time.jogadores;
        let jogadorFilter;
        if (jogadores) {
            jogadorFilter = jogadores.filter(x => x.id !== jogador.id);
        }
        else {
            jogadores = [];
        }
        time.jogadores = jogadorFilter;
        const a = await UserRepository_1.timeRepository.save(time);
        return res.json({
            removed: a
        });
    }
}
exports.TimeController = TimeController;

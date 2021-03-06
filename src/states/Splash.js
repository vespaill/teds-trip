import Phaser from 'phaser'
import { centerGameObjects } from '../utils'

export default class extends Phaser.State {
  init () {}

  preload () {
    this.loaderBg = this.add.sprite(this.game.world.centerX, this.game.world.centerY, 'loaderBg')
    this.loaderBar = this.add.sprite(this.game.world.centerX, this.game.world.centerY, 'loaderBar')
    centerGameObjects([this.loaderBg, this.loaderBar])

    this.load.setPreloadSprite(this.loaderBar)
    //
    // load your assets
    //
    this.load.image('mushroom', 'assets/images/mushroom2.png')
    this.load.spritesheet('ted', 'assets/images/ted_spritesheet.png', 256, 256)
    this.load.spritesheet('redTed', 'assets/images/red_ted_spritesheet.png',256,256)
    this.load.audio('exist_soundtrack', 'assets/audio/exist_soundtrack.wav')
  }

  create () {
    this.state.start('Level1')
  }
}

import Phaser from 'phaser'

export default class extends Phaser.Sprite {
  constructor ({ game, x, y }) {
    super(game, x, y, 'ted')

    // this.scale = {x: 0.25, y: 0.25}
    // this.scale = {x: 0.25, y: 0.25}

    this.anchor.setTo(0.5)
    this.setupAnimations()

    this.airborne = false
    this.landingNeeded = false
    this.crouching = false
    this.goingUp = false
    //this.dir = false // False = right, True = left

    this.walkSpeed = 1000
    this.jumpSpeed = 4000
    this.iniJumpInc = 3000
    this.jumpInc = 25       // Hold the jump button longer to jump higher.

    this.facingRight = 1  // 1: Ted's facing right, -1: Ted's facing left
    this.dashing = false
    this.dashIni = 3000
    this.dashCoolingDown = false
    this.dashRecoveryNeeded = false
    this.hairballing = false

    this.cursors = game.input.keyboard.addKeys({
      'up': Phaser.KeyCode.W,
      'down': Phaser.KeyCode.S,
      'left': Phaser.KeyCode.A,
      'right': Phaser.KeyCode.D,
      'flinch': Phaser.KeyCode.F,
      'dash': Phaser.KeyCode.Q,
      'hairball': Phaser.KeyCode.SPACEBAR
      })
    }

  setupAnimations () {
    this.animations.add(        'idle', [0, 0, 0, 0, 1, 2, 1, 0, 3, 4, 3, 0, 0, 0, 0, 0], 8, true)
    this.animations.add(        'walk', [16, 17, 18, 17, 16, 19, 20, 19], 16, true)
    this.animations.add(        'jump', [32, 33, 34, 35, 36, 37, 38, 39, 40], 32, false)
    this.animations.add('jump-landing', [32, 33, 34, 35, 36, 37, 38, 39], 32, false)
    this.animations.add(      'crouch', [32, 38, 37, 48, 49, 50, 51, 52], 32, false)
    this.animations.add(    'stand-up', [52, 51, 50, 49, 48, 37, 38, 32], 32, false)
    this.animations.add(      'flinch', [64,65], 16, true)
    this.animations.add(        'dash', [81,82,83,83,83,83,83,83,83,83,83,83], 48, false)
    this.animations.add( 'dashRecover', [84,85,86,86,48,37,38,39], 16, false)
    this.animations.add(    'hairball', [80,96,97,98], 16, false)
  }

  update () {
    this.airborne = this.body.touching.down? this.airborne = false : true

    if (!this.cursors.hairball.isDown)
      this.hairballing = false

    if (this.hairballing) {
      if (!this.animating)
        this.handleHairballingAnimation()
    } else if (!this.dashing) {
      this.body.velocity.x = 0
      if (this.airborne) {
        this.landingNeeded = true
        if (this.body.velocity.y < 0) {this.frame = 40}
        else                          {this.frame = 41}
      }
    }

    if ((this.goingUp && !this.cursors.up.isDown) ||
         this.body.velocity.y <= -this.jumpSpeed) {
      this.goingUp = false
    }

    if (this.goingUp && this.cursors.up.isDown) {
      this.body.velocity.y -= this.jumpInc
    }

    if (!this.animating) {
      if (this.cursors.hairball.isDown) {
        this.hairballing = true
      } else if (!this.dashCoolingDown && this.cursors.dash.isDown) {
        this.handleDashAnimation()
      } else if (!this.crouching) {
        if (this.cursors.left.isDown) {
          if (this.scale.x > 0) { this.scale.x *= -1 }
          this.body.velocity.x = -this.walkSpeed
          this.facingRight = -1
        } else if (this.cursors.right.isDown) {
          if (this.scale.x < 0) { this.scale.x *= -1 }
          this.body.velocity.x = this.walkSpeed
          this.facingRight = 1
        }

        if (!this.airborne) {
          this.dashCoolingDown = false
          if (this.landingNeeded) {
            this.handleLandingAnimation()
          } else if (this.dashRecoveryNeeded ) {
            this.handleDashRecoveryAnimation()
          } else if (this.cursors.up.isDown) {
            this.handleJumpAnimation()
          } else if (this.cursors.left.isDown || this.cursors.right.isDown) {
            this.animations.play('walk')
          } else if (this.cursors.down.isDown) {
            this.handleCrouchAnimation()
          } else {
            this.animations.play('idle')
          }
        }
      } else if (!this.cursors.down.isDown) {
        this.handleStandUpAnimation()
      }
    }
  }

  handleJumpAnimation (body) {
    this.animating = true
    this.animations.play('jump')
    setTimeout(() => {
      this.animating = false
      this.airborne = true
      this.goingUp = true
      this.body.velocity.y = -this.iniJumpInc
    }, 250)
  }

  handleLandingAnimation () {
    this.animating = true
    this.landingNeeded = false
    this.animations.play('jump-landing')
    setTimeout(() => {
      this.animating = false
      this.frame = 0
      this.dashRecoveryNeeded = false
    }, 300)
  }

  handleCrouchAnimation () {
    this.animating = true
    this.crouching = true
    this.animations.play('crouch')
    setTimeout(() => {
      this.animating = false
      this.frame = 52
    }, 250)
  }

  handleHairballingAnimation() {
    this.animating = true
    this.hairballing = true
    this.animations.play('hairball')
    setTimeout(() => {
      this.animating = false
      this.frame = 98
    }, 250)
  }

  handleStandUpAnimation () {
    this.animating = true
    this.crouching = false
    this.animations.play('stand-up')
    setTimeout(() => {
      this.animating = false
    }, 250)
  }

  handleFlinchAnimation () {
    this.animating = true
    this.animations.play('flinch')
    setTimeout(() => {
      this.animating = false
    }, 500)
  }

  handleDashAnimation () {
    this.animating = true
    this.dashing = true
    this.dashCoolingDown = true
    this.body.velocity.x = this.facingRight*this.dashIni
    this.animations.play('dash')
    this.frame = 80

    setTimeout(() => {
      this.animating = false
      this.dashing = false
      this.dashRecoveryNeeded = true
      this.body.velocity.x = 0
    }, 250)
  }

  handleDashRecoveryAnimation() {
    this.animating = true
    this.animations.play('dashRecover')

    setTimeout(() => {
      this.animating = false
      this.dashRecoveryNeeded = false
    }, 500)
  }
}
